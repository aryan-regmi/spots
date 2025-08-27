build:
	zipalign -v -p 4 \
  	src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk \
  	app-release-aligned.apk && \
	apksigner sign \
  	--ks my-release-key.jks \
  	--out app-release-signed.apk \
  	app-release-aligned.apk && \
	apksigner verify app-release-signed.apk && \
	adb install -r app-release-signed.apk && \
	rm app-release-*
