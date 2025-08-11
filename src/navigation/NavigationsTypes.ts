export type AuthStackParamList = {
    AddPlaylist: undefined;
    PlaylistType: undefined;
    PlaylistSetup: { type: string };
    PlaylistProcessed: { type: string, playlistUrl: string };
    Settings: undefined;
    GeneralSettings: undefined;
    PlaylistSettings: undefined;
    AppearanceSettings: undefined;
    PlaybackSettings: undefined;
    RemoteControlSettings: undefined;
    OtherSettings: undefined;
};

export type MainStackParamList = {
    Home: {activeScreen: string};
    Notification: undefined;
    Settings: undefined;
    Movies: {activeScreen: string};
    Shows: {activeScreen: string};
    Favorites: {activeScreen: string};
    Search: {activeScreen: string};
    GeneralSettings: undefined;
    PlaylistSettings: undefined;
    AppearanceSettings: undefined;
    PlaybackSettings: undefined;
    RemoteControlSettings: undefined;
    OtherSettings: undefined;
    Tv: {activeScreen: string};
    MoviePlayScreen: {show?: any, movie?: any};
    BuySubscription: undefined;
    LoginScreen: {from?: string} | undefined;
    SignupScreen: undefined;
    VerifyOtp: {data: any};
};
