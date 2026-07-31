import AVFoundation
import ExpoModulesCore

public class SaiAudioStreamModule: Module {
  private var audioEngine: AVAudioEngine?
  private var isRecording = false
  private var isStarting = false
  private var sequence = 0

  public func definition() -> ModuleDefinition {
    Name("SaiAudioStream")

    Events("audioChunk", "audioError")

    AsyncFunction("requestPermissionsAsync") { () async -> [String: Bool] in
      let granted = await withCheckedContinuation { continuation in
        AVAudioSession.sharedInstance().requestRecordPermission { isGranted in
          continuation.resume(returning: isGranted)
        }
      }

      return ["granted": granted]
    }

    AsyncFunction("getStatusAsync") { () -> [String: Bool] in
      return self.onMainQueue {
        ["isRecording": self.isRecording]
      }
    }

    AsyncFunction("startAsync") { (options: [String: Any]?) in
      try self.onMainQueue {
        try self.startRecording(options: options ?? [:])
      }
      return ["started": self.isRecording]
    }

    AsyncFunction("stopAsync") {
      self.onMainQueue {
        self.stopRecording()
      }
      return ["stopped": true]
    }

    OnDestroy {
      self.onMainQueue {
        self.stopRecording()
      }
    }
  }

  private func startRecording(options: [String: Any]) throws {
    if isRecording || isStarting {
      return
    }

    isStarting = true
    defer { isStarting = false }

    let session = AVAudioSession.sharedInstance()
    let permission = session.recordPermission
    guard permission == .granted else {
      throw makeAudioError(
        code: "MIC_PERMISSION_DENIED",
        message: "Microphone permission is required."
      )
    }

    let requestedSampleRate = Double(options["sampleRate"] as? Int ?? 16000)
    let requestedChunkMs = options["chunkMs"] as? Int ?? 100
    let sampleRate = requestedSampleRate.isFinite && requestedSampleRate > 0
      ? requestedSampleRate
      : 16000
    let chunkMs = min(max(requestedChunkMs, 20), 1000)

    guard sampleRate >= 8000, sampleRate <= 192000 else {
      throw makeAudioError(
        code: "UNSUPPORTED_SAMPLE_RATE",
        message: "The requested microphone sample rate is not supported."
      )
    }

    stopAudioEngine()

    do {
      try session.setCategory(
        .playAndRecord,
        mode: .voiceChat,
        options: [.defaultToSpeaker, .allowBluetooth]
      )
      try session.setPreferredIOBufferDuration(
        min(Double(chunkMs) / 1000.0, 0.02)
      )
      try session.setActive(true)
    } catch {
      deactivateSession()
      throw makeAudioError(
        code: "AUDIO_SESSION_FAILED",
        message: error.localizedDescription
      )
    }

    guard session.isInputAvailable, !session.currentRoute.inputs.isEmpty else {
      deactivateSession()
      throw makeAudioError(
        code: "AUDIO_INPUT_UNAVAILABLE",
        message: "No active microphone input is available. Disconnect other audio devices and try again."
      )
    }

    // A fresh engine avoids retaining a stale input format after route changes,
    // phone calls, Bluetooth transitions, or previous playback sessions.
    let engine = AVAudioEngine()
    let inputNode = engine.inputNode
    let inputFormat = inputNode.outputFormat(forBus: 0)

#if DEBUG
    let inputRoutes = session.currentRoute.inputs
      .map { "\($0.portType.rawValue):\($0.portName)" }
      .joined(separator: ",")
    print(
      "[SaiAudioStream] route=\(inputRoutes) hardwareRate=\(inputFormat.sampleRate) " +
      "hardwareChannels=\(inputFormat.channelCount) targetRate=\(Int(sampleRate))"
    )
#endif

    guard isValidInputFormat(inputFormat) else {
      engine.stop()
      engine.reset()
      deactivateSession()
      throw makeAudioError(
        code: "INVALID_INPUT_AUDIO_FORMAT",
        message: "The microphone returned an invalid audio format. Check the active input route and try again."
      )
    }

    guard let desiredFormat = AVAudioFormat(
      commonFormat: .pcmFormatInt16,
      sampleRate: sampleRate,
      channels: 1,
      interleaved: true
    ) else {
      deactivateSession()
      throw makeAudioError(
        code: "UNSUPPORTED_AUDIO_FORMAT",
        message: "Could not create the required 16 kHz mono PCM audio format."
      )
    }

    guard let converter = AVAudioConverter(from: inputFormat, to: desiredFormat) else {
      deactivateSession()
      throw makeAudioError(
        code: "AUDIO_CONVERTER_UNAVAILABLE",
        message: "Could not convert the microphone audio to 16 kHz mono PCM."
      )
    }

    let inputFramesPerChunk = max(
      1,
      AVAudioFrameCount(
        (inputFormat.sampleRate * Double(chunkMs) / 1000.0).rounded()
      )
    )

    sequence = 0

    inputNode.installTap(
      onBus: 0,
      bufferSize: inputFramesPerChunk,
      format: inputFormat
    ) { [weak self] buffer, _ in
      guard let self, self.isRecording else {
        return
      }

      guard self.isValidInputFormat(buffer.format) else {
        self.sendAudioError(
          code: "INVALID_CAPTURE_AUDIO_FORMAT",
          message: "The microphone audio route changed to an unsupported format. Please try again."
        )
        DispatchQueue.main.async { [weak self] in
          self?.stopRecording()
        }
        return
      }

      let rateRatio = sampleRate / buffer.format.sampleRate
      let outputFrameCapacity = max(
        1,
        AVAudioFrameCount(ceil(Double(buffer.frameLength) * rateRatio)) + 1
      )

      guard let convertedBuffer = AVAudioPCMBuffer(
        pcmFormat: desiredFormat,
        frameCapacity: outputFrameCapacity
      ) else {
        self.sendAudioError(code: "BUFFER_CREATE_FAILED", message: "Could not create PCM buffer.")
        return
      }

      var error: NSError?
      var didProvideInput = false
      let inputBlock: AVAudioConverterInputBlock = { _, outStatus in
        if didProvideInput {
          outStatus.pointee = .noDataNow
          return nil
        }

        didProvideInput = true
        outStatus.pointee = .haveData
        return buffer
      }

      let conversionStatus = converter.convert(
        to: convertedBuffer,
        error: &error,
        withInputFrom: inputBlock
      )

      if let error {
        self.sendAudioError(code: "AUDIO_CONVERT_FAILED", message: error.localizedDescription)
        return
      }

      guard
        conversionStatus == .haveData || conversionStatus == .inputRanDry,
        convertedBuffer.frameLength > 0
      else {
        return
      }

      guard let channelData = convertedBuffer.int16ChannelData else {
        self.sendAudioError(code: "PCM_DATA_UNAVAILABLE", message: "PCM audio data was unavailable.")
        return
      }

      let frameLength = Int(convertedBuffer.frameLength)
      let byteCount = frameLength * MemoryLayout<Int16>.size
      let data = Data(bytes: channelData[0], count: byteCount)

      self.sendEvent("audioChunk", [
        "channels": 1,
        "data": data.base64EncodedString(),
        "encoding": "base64",
        "sampleRate": Int(sampleRate),
        "sequence": self.sequence,
        "timestamp": Int(Date().timeIntervalSince1970 * 1000)
      ])

      self.sequence += 1
    }

    do {
      audioEngine = engine
      isRecording = true
      engine.prepare()
      try engine.start()
    } catch {
      isRecording = false
      inputNode.removeTap(onBus: 0)
      engine.stop()
      engine.reset()
      audioEngine = nil
      deactivateSession()
      throw makeAudioError(
        code: "RECORDER_START_FAILED",
        message: error.localizedDescription
      )
    }
  }

  private func stopRecording() {
    isRecording = false
    isStarting = false
    stopAudioEngine()

    deactivateSession(reportError: true)
  }

  private func stopAudioEngine() {
    guard let engine = audioEngine else {
      return
    }

    engine.inputNode.removeTap(onBus: 0)
    engine.stop()
    engine.reset()
    audioEngine = nil
  }

  private func isValidInputFormat(_ format: AVAudioFormat) -> Bool {
    let sampleRate = format.sampleRate
    let channelCount = format.channelCount

    return sampleRate.isFinite &&
      sampleRate >= 8000 &&
      sampleRate <= 192000 &&
      channelCount >= 1 &&
      channelCount <= 8
  }

  private func onMainQueue<T>(_ work: () throws -> T) rethrows -> T {
    if Thread.isMainThread {
      return try work()
    }

    return try DispatchQueue.main.sync(execute: work)
  }

  private func deactivateSession(reportError: Bool = false) {
    do {
      try AVAudioSession.sharedInstance().setActive(
        false,
        options: .notifyOthersOnDeactivation
      )
    } catch {
      if reportError {
        sendAudioError(code: "AUDIO_SESSION_STOP_FAILED", message: error.localizedDescription)
      }
    }
  }

  private func sendAudioError(code: String, message: String) {
    sendEvent("audioError", [
      "code": code,
      "message": message
    ])
  }

  private func makeAudioError(code: String, message: String) -> NSError {
    sendAudioError(code: code, message: message)

    return NSError(
      domain: "SaiAudioStream",
      code: 1,
      userInfo: [
        NSLocalizedDescriptionKey: message,
        "code": code
      ]
    )
  }
}
