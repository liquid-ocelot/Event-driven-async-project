{
  "targets": [
    {
      "target_name": "CppGenerator",
      "cflags!": [ "-fno-exceptions",				"-luser32",
				"-lgdi32",
				"-lopengl32",
				"-lgdiplus",
				"-lShlwapi",
				"-ldwmapi",
				"-lstdc++fs",
				"-static",
				"-std=c++17" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
        "./src/map.cpp",
        "./src/index.cpp",
        "./src/utilities/Utilities.cpp"      
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}