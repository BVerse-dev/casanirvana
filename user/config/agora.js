// Agora Configuration
// You'll need to:
// 1. Sign up for an Agora account at: https://www.agora.io/
// 2. Create a new project in Agora Console
// 3. Get your App ID and App Certificate
// 4. Replace the placeholders below with your actual credentials

export const AGORA_CONFIG = {
  // Replace with your Agora App ID
  APP_ID: 'your-agora-app-id-here',
  
  // Replace with your Agora App Certificate (for token generation)
  APP_CERTIFICATE: 'your-agora-app-certificate-here',
  
  // Token server URL (optional, for production use)
  TOKEN_SERVER_URL: 'https://your-token-server.com/token',
};

// Agora Channel Profile Constants
export const CHANNEL_PROFILE = {
  COMMUNICATION: 0,
  LIVE_BROADCASTING: 1,
};

// Agora Client Role Constants  
export const CLIENT_ROLE = {
  AUDIENCE: 0,
  BROADCASTER: 1,
};

// Call Status Constants
export const CALL_STATUS = {
  INITIATED: 'initiated',
  RINGING: 'ringing', 
  ANSWERED: 'answered',
  ENDED: 'ended',
  REJECTED: 'rejected',
  MISSED: 'missed',
};

// Message Status Constants
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

// Setup Instructions:
/*
1. Install Agora SDK:
   - The react-native-agora package should already be installed
   - For iOS: pod install in ios/ directory
   - For Android: Sync project

2. Get Agora Credentials:
   - Go to https://console.agora.io/
   - Create a new project
   - Get App ID from project settings
   - Get App Certificate for token generation (recommended for production)

3. Configure Permissions:
   - iOS: Add camera and microphone permissions to Info.plist
   - Android: Add camera and microphone permissions to AndroidManifest.xml

4. Update this config:
   - Replace APP_ID with your actual Agora App ID
   - For production, set up a token server and update TOKEN_SERVER_URL

5. Test the integration:
   - Use the Members screen to call other society members
   - Test voice calls and messaging functionality
*/
