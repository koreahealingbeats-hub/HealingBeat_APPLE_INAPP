import Foundation
import HealthKit

@objc(WatchLauncherModule)
class WatchLauncherModule: NSObject {
    
    private let healthStore = HKHealthStore()
    
    @objc
    func startWatchApp(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard HKHealthStore.isHealthDataAvailable() else {
            reject("HEALTHKIT_UNAVAILABLE", "HealthKit is not available on this device", nil)
            return
        }
        
        let typesToShare: Set = [HKObjectType.workoutType()]
        let typesToRead: Set = [HKObjectType.workoutType()]
        
        healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { (success, error) in
            guard success else {
                let errorMsg = error?.localizedDescription ?? "Workout authorization failed"
                reject("HEALTHKIT_AUTH_FAILED", errorMsg, error)
                return
            }
            
            let configuration = HKWorkoutConfiguration()
            configuration.activityType = .other
            configuration.locationType = .unknown
            
            self.healthStore.startWatchApp(with: configuration) { (success, error) in
                if success {
                    resolve(true)
                } else {
                    let errorMsg = error?.localizedDescription ?? "Unknown error starting watch app"
                    reject("START_WATCH_APP_FAILED", errorMsg, error)
                }
            }
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
