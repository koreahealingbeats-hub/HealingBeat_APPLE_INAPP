import SwiftUI

struct ContentView: View {
    @ObservedObject var sessionManager = WatchSessionManager.shared
    
    var body: some View {
        VStack {
            Image(systemName: "heart.fill")
                .font(.system(size: 50))
                .foregroundColor(.red)
                .padding()
            
            Text(sessionManager.statusMessage)
                .font(.headline)
            
            if sessionManager.isMeasuring {
                Text("\\(Int(sessionManager.heartRate))")
                    .font(.system(size: 40, weight: .bold))
                    .foregroundColor(.white)
            }
            
            Button(action: {
                sessionManager.startHeartRateMeasurement()
            }) {
                Text("Start")
            }
            .padding(.top)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
