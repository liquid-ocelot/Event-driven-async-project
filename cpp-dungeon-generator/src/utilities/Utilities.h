#pragma once
#ifndef ZACHROME_UTILITIES
#define ZACHROME_UTILITIES
//#include "mingw.thread.h"
//#include "mingw.invoke.h"
#include <stdint.h>
#include <random>
// namespace ZaChromeUtilities

namespace ZaChromeUtilities
{

  struct RGBA
  {
    uint8_t Red;
    uint8_t Green;
    uint8_t Blue;
    uint8_t Alpha;
    // black/white constructor
    RGBA(bool white);
    // colored constructor
    RGBA(uint8_t R, uint8_t G, uint8_t B, uint8_t A = 255);
  };

  class MTRandomGenerator
  {
  private:
    /* data */
    std::mt19937 b32r_;
    std::mt19937_64 b64r_;
    bool is64Bit;

    uint32_t B32Random() { return b32r_(); }
    uint64_t B64Random() { return b64r_(); }

  public:
    /*b64 allows to use the 64 mt19937*/
    MTRandomGenerator(uint32_t seed, bool b64 = false);
    /*b64 allows to use the 64 mt19937*/
    MTRandomGenerator(std::string seed, bool b64 = false);
    /*b64 allows to use the 64 mt19937*/
    MTRandomGenerator(bool b64 = false);
    ~MTRandomGenerator();
    uint64_t Next();
    };
}
#endif