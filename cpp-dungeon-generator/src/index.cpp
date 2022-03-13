// logic for the node addon api
#include <napi.h>
#include <string>
#include "map.h"
#include "utilities/Utilities.h"
using namespace MapGenerator;

Napi::String generateAndGetMapAsString(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  int height = (int)info[0].ToNumber();
  int width = (int)info[1].ToNumber();
  std::string seed = (std::string)info[2].ToString();
  bool noSeed = (bool)info[3].ToBoolean();
  int perThousands = (int)info[4].ToNumber();

  Map map;
  map.init(height, width, seed, noSeed, perThousands);
  map.generate();

  std::string result = map.getMapAsString();
  return Napi::String::New(env, result);
}

Napi::Object
Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(
      Napi::String::New(env, "generateAndGetMapAsString"),
      Napi::Function::New(env, generateAndGetMapAsString));

  return exports;
}

NODE_API_MODULE(CppGenerator, Init)