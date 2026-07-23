require 'json'

package = JSON.parse(
  File.read(File.join(__dir__, '..', 'package.json'))
)

Pod::Spec.new do |spec|
  spec.name = 'SaiAudioStream'
  spec.version = package['version']
  spec.summary = package['description']
  spec.description = package['description']
  spec.license = { type: 'MIT' }
  spec.author = { 'Sai Family' => 'development@saifamily.app' }
  spec.homepage = 'https://saifamily.sustaininsight.com'
  spec.platform = :ios, '15.1'
  spec.swift_version = '5.9'
  spec.source = {
    git: 'https://github.com/devesh-rn/sai-family.git',
    tag: spec.version.to_s
  }
  spec.static_framework = true

  spec.dependency 'ExpoModulesCore'

  spec.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  spec.source_files = '*.{h,m,mm,swift}'
end
