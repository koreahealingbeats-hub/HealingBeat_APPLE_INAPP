require 'xcodeproj'

project_path = 'ios/HealingBeat.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'HealingBeat' }

group = project.main_group.find_subpath(File.join('HealingBeat'), true)

swift_file_path = "ios/HealingBeat/WatchLauncherModule.swift"
m_file_path = "ios/HealingBeat/WatchLauncherModule.m"

[swift_file_path, m_file_path].each do |file_path|
  file_ref = group.files.find { |f| f.path == File.basename(file_path) }
  unless file_ref
    file_ref = group.new_reference(File.basename(file_path))
    target.add_file_references([file_ref])
    puts "Added #{file_path} to target"
  else
    puts "#{file_path} already exists in target"
  end
end

project.save
puts "Successfully saved project"
