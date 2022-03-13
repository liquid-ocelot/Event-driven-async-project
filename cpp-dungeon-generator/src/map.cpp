#include "utilities/Utilities.h"
#include "map.h"
#include <vector>
#include <unordered_map>
#include <mutex>
#include <random>
#include <string>
using namespace std;
using namespace ZaChromeUtilities;
namespace MapGenerator
{
  struct roomsToGenerate
  {
    int x;
    int y;
    int8_t probability;
    roomsToGenerate(vd2d c, int8_t p) : x(c.x), y(c.y), probability(p) {}
    vd2d coordinates() { return vd2d(x, y); }
    bool operator==(const roomsToGenerate &p2) const
    {
      return (x == p2.x) && (y == p2.y) && (probability == p2.probability);
    }
    operator string() const
    {
      string result = "to generate [x:" + to_string(x) + ";" + to_string(y) + "] probability:" + to_string((int)probability);
      return result;
    }
  };

  void Map::createOrigin()
  {
    // create the origin of generation
    int originX = rand_.Next() % (tiles_.size() - 6) + 3;
    int originY = rand_.Next() % (tiles_[0].size() - 6) + 3;
    // cout << "\n origin of the generation: " << originX << ";" << originY;

    generationMutex.lock();
    tiles_[originX][originY] = Tile(RGBA(true), vd2d(originX, originY));
    tiles_[originX][originY].setExistance(true);
    hasChanged_ = true;
    generationMutex.unlock();

    // add to existing tiles
    existingTiles.push_back(tiles_[originX][originY].getCoordinates());
  }
  Map::Map() {}

  Map::~Map() {}

  // height and width determine dimensions of the map in tiles. seed determines generation. perthousands multiplies the dimension of the map to calculate the numbers of iterations.
  void Map::init(unsigned int height, unsigned int width, unsigned int seed, bool noSeed, int perthousands)
  {
    // TODO try to secure unsigned seed input
    if (height < 7 || width < 7)
    {
      canGenerate_ = false;
      return;
    }

    perThousandsOfRooms_ = perthousands;

    currentSeedInt_ = seed;
    if (noSeed)
      rand_ = MTRandomGenerator();
    else
      rand_ = MTRandomGenerator(seed);

    tiles_.resize(height);
    for (size_t i = 0; i < height; i++)
    {
      tiles_[i].resize(width);
    }
    for (size_t i = 0; i < height; i++)
    {
      for (size_t j = 0; j < width; j++)
      {
        tiles_[i][j] = Tile(RGBA(false), vd2d(i, j)).setExistance(false);
      }
    }
    canGenerate_ = true;
    isGenerated_ = false;
  }
  // height and width determine dimensions of the map in tiles. seed determines generation. perthousands multiplies the dimension of the map to calculate the numbers of iterations.
  void Map::init(unsigned int height, unsigned int width, string seed, bool noSeed, int perthousands)
  {
    // TODO try to secure unsigned seed input
    if (height < 7 || width < 7)
    {
      canGenerate_ = false;
      return;
    }

    perThousandsOfRooms_ = perthousands;

    currentSeedString_ = seed;
    if (noSeed)
      rand_ = MTRandomGenerator();
    else
      rand_ = MTRandomGenerator(seed);

    tiles_.resize(height);
    for (size_t i = 0; i < height; i++)
    {
      tiles_[i].resize(width);
    }
    for (size_t i = 0; i < height; i++)
    {
      for (size_t j = 0; j < width; j++)
      {
        tiles_[i][j] = Tile(RGBA(false), vd2d(i, j)).setExistance(false);
      }
    }
    canGenerate_ = true;
    isGenerated_ = false;
  }

  void Map::generate()
  {
    if (!canGenerate_)
    {
      // cout << "cannot generate as the initialization was either not done or improperly done.";
      return;
    }
    // cout << "generating";
    createOrigin();
    // number of iterations for the generation loop
    int iterations = floor(tiles_.size() * tiles_[0].size() * perThousandsOfRooms_ / 1000);
    // cout << "\n iterations,xMax,yMax,percent:" << iterations << "," << tiles_.size() << "," << tiles_[0].size() << "," << perThousandsOfRooms_;

    // internal vectors to operate upon the tiles
    vector<roomsToGenerate> possibleTiles;        // tiles to try to generate
    vector<string> possibleTilesStringCollection; // indexes to modify generation chance of possible tiles....because unordered maps don't fucking fucking work like i want
    vector<vd2d> tilesToCheck;
    // cout << "\nhere 1";
    tilesToCheck.push_back(vd2d(existingTiles[0].x, existingTiles[0].y));
    // cout << "\nhere 2";

    // TODO
    // MAKE MORE OPEN
    int chances[4]{75, 0, 0, 0};
    int additionalChances[2]{10, 5};
    int percentToCheck = 40;
    /*
    formula to understand chances :
    chances refers to %chance of generating room depending on amount of already generated rooms at x coordinates
    additionalchances modifies this % by adding a random value between -additionalChances[1] and additionalChances[0]-additionalChances[1]
    example :
    using chances={75,20,10,5} and additionalChances={40,20}
    spot with 2 neighboors => % chance of being generated = 20+ [0->40]-20
    thus => % chance of being generated =20+ between -20 and 20
    */
    ///
    // generation loop
    for (size_t i = 0; i < iterations; i++)
    {
      // cout << "\n" << i << "...";
      for (auto &&tileCoordinate : tilesToCheck)
      {
        uint8_t amountOfRoomsAround = 0;
        generationMutex.lock();
        // checking o marked tile
        //  x x x
        //  o + x
        //  x x x
        if (tileCoordinate.x - 1 >= 0 && !tiles_[tileCoordinate.x - 1][tileCoordinate.y].getExistance())
        {
          int x = tileCoordinate.x - 1;
          int y = tileCoordinate.y;
          if (x - 1 >= 0 && tiles_[x - 1][y].getExistance())
            amountOfRoomsAround++;
          if (y - 1 >= 0 && tiles_[x][y - 1].getExistance())
            amountOfRoomsAround++;
          if (y + 1 < tiles_[0].size() && tiles_[x][y + 1].getExistance())
            amountOfRoomsAround++;
          string key = to_string(x) + ";" + to_string(y);
          if (!count(possibleTilesStringCollection.begin(), possibleTilesStringCollection.end(), key))
          {
            possibleTilesStringCollection.push_back(key);
            possibleTiles.push_back(roomsToGenerate(vd2d(x, y), chances[amountOfRoomsAround])); // + (rand_.Next()% additionalChances[0]) - additionalChances[1]));
          }
          else
          {
            possibleTiles[find(possibleTilesStringCollection.begin(), possibleTilesStringCollection.end(), key) - possibleTilesStringCollection.begin()] = roomsToGenerate(vd2d(x, y), chances[amountOfRoomsAround]);
          }
          amountOfRoomsAround = 0;
        }
        // checking o marked tile
        // x x x
        // x + o
        // x x x
        if (tileCoordinate.x + 1 < tiles_.size() && !tiles_[tileCoordinate.x + 1][tileCoordinate.y].getExistance())
        {
          int x = tileCoordinate.x + 1;
          int y = tileCoordinate.y;
          if (x + 1 < tiles_.size() && tiles_[x + 1][y].getExistance())
            amountOfRoomsAround++;
          if (y - 1 >= 0 && tiles_[x][y - 1].getExistance())
            amountOfRoomsAround++;
          if (y + 1 < tiles_[0].size() && tiles_[x][y + 1].getExistance())
            amountOfRoomsAround++;
          string key = to_string(x) + ";" + to_string(y);
          if (!count(possibleTilesStringCollection.begin(), possibleTilesStringCollection.end(), key))
          {
            possibleTilesStringCollection.push_back(key);
            possibleTiles.push_back(roomsToGenerate(vd2d(x, y), chances[amountOfRoomsAround])); // + (rand_.Next()% additionalChances[0]) - additionalChances[1]));
          }
          else
          {
            possibleTiles[find(possibleTilesStringCollection.begin(), possibleTilesStringCollection.end(), key) - possibleTilesStringCollection.begin()] = roomsToGenerate(vd2d(x, y), chances[amountOfRoomsAround]);
          }
          amountOfRoomsAround = 0;
        }
        // checking o marked tile
        // x x x
        // x + x
        // x o x
        if (tileCoordinate.y - 1 >= 0 && !tiles_[tileCoordinate.x][tileCoordinate.y - 1].getExistance())
        {

          int x = tileCoordinate.x;
          int y = tileCoordinate.y - 1;
          if (x - 1 >= 0 && tiles_[x - 1][y].getExistance())
            amountOfRoomsAround++;
          if (x + 1 < tiles_.size() && tiles_[x + 1][y].getExistance())
            amountOfRoomsAround++;
          if (y - 1 >= 0 && tiles_[x][y - 1].getExistance())
            amountOfRoomsAround++;
          string key = to_string(x) + ";" + to_string(y);
          if (!count(possibleTilesStringCollection.begin(), possibleTilesStringCollection.end(), key))
          {
            possibleTilesStringCollection.push_back(key);
            possibleTiles.push_back(roomsToGenerate(vd2d(x, y), chances[amountOfRoomsAround])); // + (rand_.Next()% additionalChances[0]) - additionalChances[1]));
          }
          else
          {
            possibleTiles[find(possibleTilesStringCollection.begin(), possibleTilesStringCollection.end(), key) - possibleTilesStringCollection.begin()] = roomsToGenerate(vd2d(x, y), chances[amountOfRoomsAround]);
          }
          amountOfRoomsAround = 0;
        }
        // checking o marked tile
        // x o x
        // x + x
        // x x x
        if (tileCoordinate.y + 1 < tiles_.size() && !tiles_[tileCoordinate.x][tileCoordinate.y + 1].getExistance())
        {

          int x = tileCoordinate.x;
          int y = tileCoordinate.y + 1;
          if (x - 1 > 0 && tiles_[x - 1][y].getExistance())
            amountOfRoomsAround++;
          if (x + 1 < tiles_.size() && tiles_[x + 1][y].getExistance())
            amountOfRoomsAround++;
          if (y + 1 < tiles_[0].size() && tiles_[x][y + 1].getExistance())
            amountOfRoomsAround++;
          string key = to_string(x) + ";" + to_string(y);
          if (!count(possibleTilesStringCollection.begin(), possibleTilesStringCollection.end(), key))
          {
            possibleTilesStringCollection.push_back(key);
            possibleTiles.push_back(roomsToGenerate(vd2d(x, y), chances[amountOfRoomsAround])); // + (rand_.Next()% additionalChances[0]) - additionalChances[1]));
          }
          else
          {
            possibleTiles[find(possibleTilesStringCollection.begin(), possibleTilesStringCollection.end(), key) - possibleTilesStringCollection.begin()] = roomsToGenerate(vd2d(x, y), chances[amountOfRoomsAround]);
          }
          amountOfRoomsAround = 0;
        }
        generationMutex.unlock();
      }
      // cout << "amount of tiles that can be generated " << possibleTiles.size() << "\t";
      /*for (auto &&item : possibleTiles)
      {
        std:://cout << (int)item.second.probability << " ; ";
      }*/

      tilesToCheck.clear();
      //  tilesToCheck.erase(tilesToCheck.cbegin,tilesToCheck.cend);
      int chanceToGenerate = (rand_.Next() % 99) + 1; // 60 + 40;
      vector<int> itemsToDelete;
      int quantityToCheck = possibleTiles.size() * ((float)percentToCheck / 100) + 1;
      if (quantityToCheck < 1)
      {
        quantityToCheck = 1;
        chanceToGenerate = 0;
      }
      // cout << "amount of tiles to check " << quantityToCheck << "\t";
      // cout << "\nchance to generate new room:" << 100 - chanceToGenerate << "%";
      vector<int> alreadyTakenIndex;
      for (size_t i = 0; i < quantityToCheck; i++)
      {
        int index = rand_.Next() % (possibleTiles.size() - 1);
        if (alreadyTakenIndex.size() >= 1)
        {
          while (count(alreadyTakenIndex.begin(), alreadyTakenIndex.end(), index))
          {
            index = rand_.Next() % (possibleTiles.size() - 1);
          }
        }
        alreadyTakenIndex.push_back(index);
        roomsToGenerate rtg = possibleTiles[index];
        string tempor = rtg;
        // cout << "\ntrying to generate " << tempor;
        if (rtg.probability >= chanceToGenerate)
        {
          itemsToDelete.push_back(index);
          generationMutex.lock();
          tiles_[rtg.x][rtg.y] = Tile(RGBA(true), vd2d(rtg.x, rtg.y)).setExistance(true);
          // std::this_thread::sleep_for(std::chrono::milliseconds(1));
          generationMutex.unlock();
          existingTiles.push_back(vd2d(rtg.x, rtg.y));
          tilesToCheck.push_back(vd2d(rtg.x, rtg.y));
        }
      }
      for (size_t i = 0; i < itemsToDelete.size(); i++)
      {
        swap(possibleTiles[itemsToDelete[i]], possibleTiles[possibleTiles.size() - 1]);
        swap(possibleTilesStringCollection[itemsToDelete[i]], possibleTilesStringCollection[possibleTilesStringCollection.size() - 1]);
        possibleTiles.pop_back();
        possibleTilesStringCollection.pop_back();
      }
      // cout << "\nremaining possible tiles " << possibleTiles.size() << ". There should be as many indexes " << possibleTilesStringCollection.size();

      // save the fact that the map has changed
      generationMutex.lock();
      hasChanged_ = true;
      generationMutex.unlock();
      // std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
    // cout << "generation finished";
    isGenerated_ = true;
  }

  bool Map::displayingMap()
  {
    if (generationMutex.try_lock())
    {
      hasChanged_ = false;
      generationMutex.unlock();
      return true;
    }
    else
      return false;
  }
  RGBA Map::getTileColors(int x, int y)
  {
    RGBA temporary(false);
    while (true)
    {
      if (generationMutex.try_lock())
      {
        temporary = tiles_[x][y].getColor();
        generationMutex.unlock();
        return temporary;
      }
    }
  }
  string Map::getMapAsString()
  {
    if (!isGenerated_)
    {
      return "generate map before";
    }
    string result = to_string(tiles_.size());
    for (size_t i = 0; i < tiles_.size(); i++)
    {
      for (size_t j = 0; j < tiles_[i].size(); j++)
      {
        if (tiles_[i][j].getExistance())
          result += ";1";
        else
          result += ";0";
      }
    }
    return result;
  }
}