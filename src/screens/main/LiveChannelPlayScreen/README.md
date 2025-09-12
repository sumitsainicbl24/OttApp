# ChannelList Component

A React Native component for displaying a list of TV channels with EPG (Electronic Program Guide) information, designed for TV remote navigation.

## Features

- **TV Remote Navigation**: Supports up/down navigation with TV remote controls
- **Channel Information**: Displays channel number, name, and current program
- **EPG Integration**: Shows current program information from EPG data
- **Focus Management**: Visual focus indicators for TV navigation
- **Base64 Decoding**: Automatically decodes base64-encoded program titles
- **Selection Handling**: Callback for channel selection events

## Usage

```tsx
import ChannelList, { ChannelData } from './ChannelList';

const MyComponent = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>();

  const handleChannelSelect = (channel: ChannelData) => {
    setSelectedChannelId(channel.epg_channel_id);
    // Handle channel selection logic
  };

  return (
    <ChannelList
      channels={channelData}
      onChannelSelect={handleChannelSelect}
      selectedChannelId={selectedChannelId}
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `channels` | `ChannelData[]` | Yes | Array of channel data objects |
| `onChannelSelect` | `(channel: ChannelData) => void` | Yes | Callback function when a channel is selected |
| `selectedChannelId` | `string` | No | ID of the currently selected channel |

## ChannelData Interface

```tsx
interface ChannelData {
  num: number;                    // Channel number
  name: string;                   // Channel name
  stream_type: string;            // Type of stream (e.g., "live")
  stream_id: number;              // Unique stream identifier
  stream_icon: string;            // URL to channel logo
  epg_channel_id: string;         // EPG channel identifier
  added: string;                  // Date added timestamp
  is_adult: number;               // Adult content flag
  category_id: string;            // Category identifier
  category_ids: number[];         // Array of category IDs
  custom_sid: string;             // Custom stream ID
  tv_archive: number;             // Archive availability flag
  direct_source: string;          // Direct source URL
  tv_archive_duration: number;    // Archive duration
  title: string;                  // Channel title
  logo: string;                   // Channel logo URL
  group: string;                  // Channel group
  url: string;                    // Stream URL
  epg: Epg[];                     // EPG program data
  type: string;                   // Content type
}
```

## EPG Interface

```tsx
interface Epg {
  id: string;                     // Program ID
  epg_id: string;                 // EPG identifier
  title: string;                  // Program title (base64 encoded)
  lang: string;                   // Language
  start: string;                  // Start time
  end: string;                    // End time
  description: string;            // Program description (base64 encoded)
  channel_id: string;             // Channel ID
  start_timestamp: string;        // Start timestamp
  stop_timestamp: string;         // Stop timestamp
  now_playing: number;            // Currently playing flag
  has_archive: number;            // Archive availability
}
```

## TV Remote Controls

- **Up Arrow**: Navigate to previous channel
- **Down Arrow**: Navigate to next channel
- **Select**: Select the focused channel

## Styling

The component uses a custom stylesheet (`ChannelListStyles.ts`) with the following key styles:

- `channelItem`: Base channel item container
- `channelItemFocused`: Focused state styling
- `channelItemSelected`: Selected state styling
- `channelContent`: Content layout container
- `channelNumber`: Channel number text
- `channelName`: Channel name text
- `currentProgram`: Current program text

## Example Data

```tsx
const sampleChannels = [
  {
    num: 1,
    name: "4K | NPO 1",
    stream_type: "live",
    stream_id: 2995,
    stream_icon: "https://example.com/logo.png",
    epg_channel_id: "npo1.nl",
    // ... other properties
    epg: [
      {
        id: "135291144",
        title: "TWNEb25hbGQgYW5kIERvZGRz", // Base64 encoded
        start: "2025-09-08 00:20:00",
        end: "2025-09-08 01:50:00",
        now_playing: 1,
        // ... other EPG properties
      }
    ]
  }
];
```

## Integration with LeftChannelView

The ChannelList component is integrated into the `LeftChannelView` component to display channels on the right side when a category is selected from the left panel.

```tsx
// In LeftChannelView.tsx
<View style={styles.channelListContainer}>
  <ChannelList
    channels={selectedCategoryData}
    onChannelSelect={handleChannelSelect}
    selectedChannelId={selectedChannelId}
  />
</View>
```

## Testing

Use the `ChannelListTest` component to test the functionality:

```tsx
import ChannelListTest from './ChannelListTest';

// Use in your app for testing
<ChannelListTest />
```

## Dependencies

- React Native
- react-native-fast-image (for image loading)
- Custom scaling utilities
- Font family constants
- Color constants

## Notes

- Program titles are automatically decoded from base64 format
- The component handles cases where EPG data is missing or empty
- Focus management is optimized for TV remote navigation
- The component is designed to work within the existing app's design system
