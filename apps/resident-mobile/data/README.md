# Sample Member Data

This directory contains sample data for testing and development of the Member Directory feature.

## 📁 Files

### `sampleMemberData.ts`
Contains comprehensive sample data for community members, admins, and committee members.

**Data Structure:**
- **Regular Members**: 12 residents across different blocks
- **Admins**: 3 community administrators 
- **Committee Members**: 5 management committee members
- **Total**: 20 community members

**Block Distribution:**
- Block A: 6 members
- Block B: 4 members  
- Block C: 5 members
- Block D: 5 members

## 🎯 Usage

### In React Native Components
```typescript
import { 
  sampleMembers, 
  sampleAdmins, 
  sampleCommittee,
  getAllSampleMembers,
  getSampleMembersByRole 
} from '../data/sampleMemberData';

// Get all members
const allMembers = getAllSampleMembers();

// Get members by role
const admins = getSampleMembersByRole('admin');
const committee = getSampleMembersByRole('management');
const regularMembers = getSampleMembersByRole('user');
```

### In Hooks (useCommunityMembers.ts)
The hooks automatically fall back to sample data when no real data is available:

```typescript
// If no real data, return sample data for development/testing
if (transformedData.length === 0) {
  console.log('📝 useCommunityMembers: No real data found, returning sample data');
  return sampleMembers;
}
```

## 🧪 Testing

Run the test script to verify data structure:
```bash
node scripts/testSampleData.js
```

## 🌱 Database Seeding

To populate a development database with sample data:
```bash
node scripts/seedMemberData.js
```

**Note:** Requires proper Supabase configuration and service key.

## 📊 Data Properties

Each member record includes:

```typescript
interface CommunityMember {
  key: string;           // Unique identifier
  id: string;            // Member ID
  name: string;          // Full name
  flatNo: string;        // Unit/apartment number
  block: string;         // Building block (A, B, C, D)
  communityName: string;   // Community name
  email: string;         // Email address
  phone: string;         // Phone number
  role: string;          // 'user' | 'admin' | 'management'
  status: string;        // Member status
  avatar_url: string | null; // Profile image URL
  image: any;            // Local image asset
}
```

## 🎨 Member Images

Sample data uses placeholder images from:
- `../assets/images/member1.png` to `../assets/images/member14.png`

Images are automatically assigned based on member ID for consistency.

## 🔄 Real Data Integration

In production, this sample data serves as:
1. **Fallback data** when no real members exist
2. **Development data** for testing UI components
3. **Structure reference** for database schema

Real data will be:
- Managed through admin dashboard
- Created via user registration
- Synced with Supabase database
- Updated through real-time subscriptions

## 🚀 Member Directory Features

The sample data supports all Member Directory features:

- ✅ **Search**: By name, email, or phone
- ✅ **Filtering**: By role (All, Admins, Committee, Members)
- ✅ **Role Badges**: Visual role indicators
- ✅ **Contact Actions**: Call and chat functionality
- ✅ **Sorting**: Prioritized by role then alphabetical
- ✅ **Statistics**: Live member counts
- ✅ **Real-time Updates**: Subscription support

## 📱 UI Testing

Perfect for testing:
- Empty states (modify data to return empty arrays)
- Loading states (add delays in hooks)
- Search functionality (diverse names and contact info)
- Filter functionality (balanced role distribution)
- Responsive design (varied name lengths and data)

## 🔧 Customization

To modify sample data:

1. **Add Members**: Extend arrays in `sampleMemberData.ts`
2. **Change Roles**: Update `role` property
3. **Add Blocks**: Include new block letters
4. **Update Images**: Reference different image assets
5. **Modify Community**: Change `communityName` property

## 📈 Statistics

Current sample data provides:
- Realistic member distribution
- Diverse contact information
- Balanced role representation
- Comprehensive block coverage
- Varied unit numbers and types

This ensures robust testing of all Member Directory features! 🎉
