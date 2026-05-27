import Foundation
import WatchConnectivity
import HealthKit
import Combine

class WatchSessionManager: NSObject, WCSessionDelegate, ObservableObject, HKWorkoutSessionDelegate {
    static let shared = WatchSessionManager()
    
    @Published var heartRate: Double = 0
    @Published var isMeasuring = false
    @Published var statusMessage = "Idle"
    
    private let healthStore = HKHealthStore()
    private var heartRateQuery: HKQuery?
    private var workoutSession: HKWorkoutSession?
    
    override private init() {
        super.init()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("WCSession activated: \\(activationState.rawValue)")
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        if let command = message["command"] as? String, command == "START_MEASUREMENT" {
            DispatchQueue.main.async {
                if !self.isMeasuring {
                    self.startHeartRateMeasurement()
                }
            }
        }
    }
    
    // MARK: - HealthKit
    
    func startHeartRateMeasurement() {
        if isMeasuring || workoutSession != nil { return }
        
        guard HKHealthStore.isHealthDataAvailable() else {
            DispatchQueue.main.async { self.statusMessage = "HealthKit unavailable" }
            return
        }
        
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else { return }
        
        let typesToShare: Set = [HKObjectType.workoutType()]
        let typesToRead: Set = [heartRateType, HKObjectType.workoutType()]
        
        healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { [weak self] (success, error) in
            guard success else {
                DispatchQueue.main.async { self?.statusMessage = "Permission denied" }
                return
            }
            self?.startWorkoutSession()
        }
    }
    
    // 아이폰 앱에서 (startWatchApp) 실행 시 호출할 새 진입점
    func handleWorkoutConfiguration(_ configuration: HKWorkoutConfiguration) {
        startWorkoutSession(with: configuration)
    }

    private func startWorkoutSession(with config: HKWorkoutConfiguration? = nil) {
        guard workoutSession == nil else {
            print("Workout session already active")
            return
        }
        
        let configuration = config ?? {
            let config = HKWorkoutConfiguration()
            config.activityType = .other
            config.locationType = .unknown
            return config
        }()
        
        do {
            workoutSession = try HKWorkoutSession(healthStore: healthStore, configuration: configuration)
            workoutSession?.delegate = self
            workoutSession?.startActivity(with: Date())
            
            DispatchQueue.main.async {
                self.isMeasuring = true
                self.statusMessage = "Measuring..."
            }
            
            startQuery(quantityType: HKQuantityType.quantityType(forIdentifier: .heartRate)!)
        } catch {
            DispatchQueue.main.async { self.statusMessage = "Failed to start session" }
        }
    }
    
    // MARK: - HKWorkoutSessionDelegate
    
    func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        if toState == .ended || toState == .stopped {
            if let query = self.heartRateQuery {
                healthStore.stop(query)
                self.heartRateQuery = nil
            }
            self.workoutSession = nil
            DispatchQueue.main.async {
                self.isMeasuring = false
                self.statusMessage = "Idle"
            }
        }
    }
    
    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        print("Workout Session Failed: \\(error.localizedDescription)")
    }
    
    private func startQuery(quantityType: HKQuantityType) {
        DispatchQueue.main.async {
            self.isMeasuring = true
            self.statusMessage = "Measuring..."
        }
        
        let predicate = HKQuery.predicateForSamples(withStart: Date(), end: nil, options: .strictStartDate)
        
        let query = HKAnchoredObjectQuery(type: quantityType, predicate: predicate, anchor: nil, limit: HKObjectQueryNoLimit) { (query, samples, deletedObjects, newAnchor, error) in
            self.process(samples: samples)
        }
        
        query.updateHandler = { (query, samples, deletedObjects, newAnchor, error) in
            self.process(samples: samples)
        }
        
        healthStore.execute(query)
        self.heartRateQuery = query
    }
    
    private func process(samples: [HKSample]?) {
        guard let heartRateSamples = samples as? [HKQuantitySample] else { return }
        
        if let sample = heartRateSamples.last {
            let bpm = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
            DispatchQueue.main.async {
                self.heartRate = bpm
                self.statusMessage = String(format: "%.0f BPM", bpm)
                self.sendHeartRateToPhone(bpm: bpm)
            }
        }
    }
    
    private func sendHeartRateToPhone(bpm: Double) {
        if WCSession.default.isReachable {
            WCSession.default.sendMessage(["heartRate": bpm], replyHandler: nil, errorHandler: { error in
                print("Error sending message: \\(error.localizedDescription)")
            })
        }
    }
}
