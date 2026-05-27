import SwiftUI
import HealthKit
import WatchKit

// This delegate is required to intercept the watch app launch triggered by the iPhone's `HKHealthStore.startWatchApp`
class ExtensionDelegate: NSObject, WKExtensionDelegate {
    func handle(_ workoutConfiguration: HKWorkoutConfiguration) {
        // Forward the configuration coming from the iPhone to our manager
        WatchSessionManager.shared.handleWorkoutConfiguration(workoutConfiguration)
    }
}

@main
struct HealingBeatWatch_Watch_AppApp: App {
    @WKExtensionDelegateAdaptor(ExtensionDelegate.self) var delegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
