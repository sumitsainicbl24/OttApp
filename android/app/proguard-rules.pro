# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep XMLHttpRequest and related networking classes
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep React Native networking
-keep class com.facebook.react.modules.network.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Keep file system related classes for RNFS
-keep class com.rnfs.** { *; }
-dontwarn com.rnfs.**
