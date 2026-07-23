import AVFoundation
import ExpoModulesCore

public class SaiAudioStreamModule: Module {
  private let audioEngine = AVAudioEngine()
  private var isRecording = false
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
      return ["isRecording": self.isRecording]
    }

    AsyncFunction("startAsync") { (options: [String: Any]?) in
      try self.startRecording(options: options ?? [:])
      return ["started": true]
    }

    AsyncFunction("stopAsync") {
      self.stopRecording()
      return ["stopped": true]
    }

    OnDestroy {
      self.stopRecording()
    }
  }

  private func startRecording(options: [String: Any]) throws {
    if isRecording {
      return
    }

    let session = AVAudioSession.sharedInstance()
    let permission = session.recordPermission
    guard permission == .granted else {
      sendAudioError(code: "MIC_PERMISSION_DENIED", message: "Microphone permission is required.")
      return
    }

    let requestedSampleRate = Double(options["sampleRate"] as? Int ?? 16000)
    let requestedChunkMs = options["chunkMs"] as? Int ?? 100
    let sampleRate = requestedSampleRate.isFinite && requestedSampleRate > 0
      ? requestedSampleRate
      : 16000
    let chunkMs = min(max(requestedChunkMs, 20), 1000)

    audioEngine.stop()
    audioEngine.reset()

    do {
      try session.setCategory(
        .playAndRecord,
        mode: .voiceChat,
        options: [.defaultToSpeaker, .allowBluetooth]
      )
      try session.setPreferredSampleRate(sampleRate)
      try session.setPreferredIOBufferDuration(Double(chunkMs) / 1000.0)
      try session.setActive(true)
    } catch {
      sendAudioError(code: "AUDIO_SESSION_FAILED", message: error.localizedDescription)
      return
    }

    let inputNode = audioEngine.inputNode
    let inputFormat = inputNode.outputFormat(forBus: 0)

    guard
      inputFormat.sampleRate.isFinite,
      inputFormat.sampleRate > 0,
      inputFormat.channelCount > 0
    else {
      deactivateSession()
      sendAudioError(
        code: "INVALID_INPUT_AUDIO_FORMAT",
        message: "The microphone returned an invalid audio format. Check the active input route and try again."
      )
      return
    }

    guard let desiredFormat = AVAudioFormat(
      commonFormat: .pcmFormatInt16,
      sampleRate: sampleRate,
      channels: 1,
      interleaved: true
    ) else {
      deactivateSession()
      sendAudioError(code: "UNSUPPORTED_AUDIO_FORMAT", message: "Could not create PCM audio format.")
      return
    }

    guard let converter = AVAudioConverter(from: inputFormat, to: desiredFormat) else {
      deactivateSession()
      sendAudioError(
        code: "AUDIO_CONVERTER_UNAVAILABLE",
        message: "Could not convert the microphone audio to 16 kHz mono PCM."
      )
      return
    }

    let inputFramesPerChunk = max(
      1,
      AVAudioFrameCount(
        (inputFormat.sampleRate * Double(chunkMs) / 1000.0).rounded()
      )
    )

    sequence = 0

    inputNode.removeTap(onBus: 0)
    inputNode.installTap(
      onBus: 0,
      bufferSize: inputFramesPerChunk,
      format: nil
    ) { [weak self] buffer, _ in
      guard let self, self.isRecording else {
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
      isRecording = true
      audioEngine.prepare()
      try audioEngine.start()
    } catch {
      isRecording = false
      inputNode.removeTap(onBus: 0)
      audioEngine.stop()
      audioEngine.reset()
      deactivateSession()
      sendAudioError(code: "RECORDER_START_FAILED", message: error.localizedDescription)
    }
  }

  private func stopRecording() {
    guard isRecording else {
      return
    }

    isRecording = false
    audioEngine.inputNode.removeTap(onBus: 0)
    audioEngine.stop()
    audioEngine.reset()

    deactivateSession(reportError: true)
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
}
