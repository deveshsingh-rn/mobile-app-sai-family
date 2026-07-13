package com.saifamily.audiostream

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Base64
import androidx.core.app.ActivityCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicBoolean

class SaiAudioStreamModule : Module() {
  private val isRecording = AtomicBoolean(false)
  private var audioRecord: AudioRecord? = null
  private var recordingThread: Thread? = null
  private var sequence = 0

  override fun definition() = ModuleDefinition {
    Name("SaiAudioStream")

    Events("audioChunk", "audioError")

    AsyncFunction("requestPermissionsAsync") {
      val activity = appContext.currentActivity
      if (activity == null) {
        return@AsyncFunction mapOf("granted" to false)
      }

      val hasPermission = ActivityCompat.checkSelfPermission(
        activity,
        Manifest.permission.RECORD_AUDIO
      ) == PackageManager.PERMISSION_GRANTED

      if (!hasPermission) {
        ActivityCompat.requestPermissions(
          activity,
          arrayOf(Manifest.permission.RECORD_AUDIO),
          49031
        )
      }

      return@AsyncFunction mapOf(
        "granted" to (
          ActivityCompat.checkSelfPermission(
            activity,
            Manifest.permission.RECORD_AUDIO
          ) == PackageManager.PERMISSION_GRANTED
        )
      )
    }

    AsyncFunction("getStatusAsync") {
      return@AsyncFunction mapOf("isRecording" to isRecording.get())
    }

    AsyncFunction("startAsync") { options: Map<String, Any?>? ->
      startRecording(options ?: emptyMap())
      return@AsyncFunction mapOf("started" to true)
    }

    AsyncFunction("stopAsync") {
      stopRecording()
      return@AsyncFunction mapOf("stopped" to true)
    }

    OnDestroy {
      stopRecording()
    }
  }

  private fun startRecording(options: Map<String, Any?>) {
    if (isRecording.get()) {
      return
    }

    val context = appContext.reactContext ?: run {
      sendAudioError("NO_CONTEXT", "React context is unavailable.")
      return
    }

    if (ActivityCompat.checkSelfPermission(
        context,
        Manifest.permission.RECORD_AUDIO
      ) != PackageManager.PERMISSION_GRANTED
    ) {
      sendAudioError("MIC_PERMISSION_DENIED", "Microphone permission is required.")
      return
    }

    val sampleRate = (options["sampleRate"] as? Number)?.toInt() ?: 16000
    val chunkMs = (options["chunkMs"] as? Number)?.toInt() ?: 100
    val channelConfig = AudioFormat.CHANNEL_IN_MONO
    val audioFormat = AudioFormat.ENCODING_PCM_16BIT
    val bytesPerSample = 2
    val channels = 1
    val desiredChunkBytes = ((sampleRate * chunkMs) / 1000) * bytesPerSample * channels
    val minBufferBytes = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)

    if (minBufferBytes <= 0) {
      sendAudioError("UNSUPPORTED_AUDIO_FORMAT", "Device does not support requested audio format.")
      return
    }

    val recordBufferBytes = maxOf(minBufferBytes, desiredChunkBytes * 2)

    try {
      val recorder = AudioRecord(
        MediaRecorder.AudioSource.VOICE_RECOGNITION,
        sampleRate,
        channelConfig,
        audioFormat,
        recordBufferBytes
      )

      if (recorder.state != AudioRecord.STATE_INITIALIZED) {
        recorder.release()
        sendAudioError("RECORDER_INIT_FAILED", "Could not initialize microphone recorder.")
        return
      }

      audioRecord = recorder
      sequence = 0
      isRecording.set(true)
      recorder.startRecording()

      recordingThread = Thread {
        val buffer = ByteArray(desiredChunkBytes)

        while (isRecording.get()) {
          val read = recorder.read(buffer, 0, buffer.size)

          if (read > 0) {
            val payload = if (read == buffer.size) buffer else buffer.copyOf(read)
            sendEvent(
              "audioChunk",
              mapOf(
                "channels" to channels,
                "data" to Base64.encodeToString(payload, Base64.NO_WRAP),
                "encoding" to "base64",
                "sampleRate" to sampleRate,
                "sequence" to sequence++,
                "timestamp" to System.currentTimeMillis()
              )
            )
          } else if (read < 0) {
            sendAudioError("RECORDER_READ_FAILED", "Microphone read failed with code $read.")
            break
          }
        }
      }.also {
        it.name = "SaiAudioStreamRecorder"
        it.start()
      }
    } catch (error: Throwable) {
      isRecording.set(false)
      sendAudioError("RECORDER_START_FAILED", error.message ?: "Could not start microphone recorder.")
    }
  }

  private fun stopRecording() {
    if (!isRecording.getAndSet(false)) {
      return
    }

    try {
      audioRecord?.stop()
    } catch (_: Throwable) {
      // Recorder may already be stopped by the platform.
    }

    try {
      audioRecord?.release()
    } catch (_: Throwable) {
      // Release is best effort.
    }

    audioRecord = null
    recordingThread = null
  }

  private fun sendAudioError(code: String, message: String) {
    sendEvent(
      "audioError",
      mapOf(
        "code" to code,
        "message" to message
      )
    )
  }
}
