# React Native / Expo — keep JS bridge and Hermes classes used via reflection
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.react.** { *; }
-keep class expo.modules.** { *; }

# Secure storage / biometrics
-keep class androidx.biometric.** { *; }
