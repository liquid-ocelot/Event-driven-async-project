#include "Utilities.h"
#include <stdint.h>
#include <random>
#include <chrono>

namespace ZaChromeUtilities
{

  RGBA::RGBA(bool white) : Red(255 * white), Green(255 * white), Blue(255 * white), Alpha(255) {}
  RGBA::RGBA(uint8_t R, uint8_t G, uint8_t B, uint8_t A) : Red(R), Green(G), Blue(B), Alpha(A) {}

  /*b64 allows to use the 64 mt19937*/
  MTRandomGenerator::MTRandomGenerator(uint32_t seed, bool b64)
  {
    std::seed_seq seedSeq({seed});
    if (b64)
    {

      b64r_.seed(seedSeq);
      is64Bit = true;
    }
    else
    {
      b32r_.seed(seedSeq);
      is64Bit = false;
    }
  }
  /*b64 allows to use the 64 mt19937*/
  MTRandomGenerator::MTRandomGenerator(std::string seed, bool b64)
  {
    std::seed_seq seedSeq(seed.begin(), seed.end());
    if (b64)
    {
      b64r_.seed(seedSeq);
      is64Bit = true;
    }
    else
    {
      b32r_.seed(seedSeq);
      is64Bit = false;
    }
  }
  /*b64 allows to use the 64 mt19937*/
  MTRandomGenerator::MTRandomGenerator(bool b64)
  {
    if (b64)
    {
      b64r_.seed(std::chrono::high_resolution_clock::now().time_since_epoch().count());
      is64Bit = true;
    }
    else
    {
      b32r_.seed(std::chrono::high_resolution_clock::now().time_since_epoch().count());
      is64Bit = false;
    }
  }
  MTRandomGenerator::~MTRandomGenerator()
  {
  }

  uint64_t MTRandomGenerator::Next()
  {
    if (is64Bit)
      return b64r_();
    else
      return b32r_();
  }
}