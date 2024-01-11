//#region Constants
const DEV_MODE = 1;             //--- 0: disabled, 1: offline, 2: offline & online
const DEV_SKIP_INTRO = 0;       //--- When true, intro screen will be skipped. Offline mode only.
const DEV_MANUAL_LOAD = 1;      //--- When true, loading screen has to be progressed manually by clicking on play button. Dev mode only.

const FORCED_START = [];        //--- When defined, all new tiles will start on this position instead of the one configured in ORIGIN_POSITIONS
const TILE_DRAG_SNAP = 0;       //--- Snap tiles to grid even when dragging the tile
const DEFAULT_ZOOM = 1;         //--- Default view box zoom

const DEFAULT_LANGUAGE = "en";  //--- Default localization language
//#endregion

//#region Tiles
//--- Target positions of individual tiles. Imported from Google Sheets.
const TARGET_POSITIONS = new Map([
    ["tile08", [-2,1]],	["tile10", [-2,0]],		
    ["tile04", [-1,1]],	["tile07", [-1,0]],		
    ["tile03", [0,1]],	["tile01", [0,0]],	["tile05", [0,-1]],	["tile11", [0,-2]],
    ["tile12", [1,1]],	["tile02", [1,0]],	["tile06", [1,-1]],	["tile09", [1,-2]],
]);

//--- Starting positions of individual tiles. Imported from Google Sheets.
const ORIGIN_POSITIONS = new Map([								
    ["tile10", [-4,3]],						
    ["tile06", [-3,-2]],	["tile09", [-3,-3]],
        ["tile08", [-2,-3]],
        
["tile07", [0,3]],			["tile01", [0,0]],			
["tile03", [1,3]],						
["tile04", [2,3]],	["tile12", [2,2]],					
["tile02", [3,2]],	["tile05", [3,1]],	["tile11", [3,0]],																	
]);
//#endregion

//#region Elements
const ID_TILES_ELEMENT = "tiles";
const GAME_STATE_DEFAULT = "gameStateDefault";
const GAME_STATE_MOVE = "gameStateMove";
//#endregion

//#region Events
const EVENT_GAME_INIT = "GameInit";
const EVENT_GAME_DRAG_START = "GameDragStart";
const EVENT_GAME_DRAG = "GameDrag";
const EVENT_GAME_DRAG_END = "GameDragEnd";
const EVENT_TILE_CONFIRMED = "TileConfirmed";
const EVENT_PAUSE = "Pause";
//#endregion

//#region Variables
const VAR_GRID_X = "gX";
const VAR_GRID_Y = "gY";
const VAR_GRID_TARGET_X = "gtX";
const VAR_GRID_TARGET_Y = "gtY";
const VAR_TARGET_X = "tX";
const VAR_TARGET_Y = "tY";
const VAR_CONFIRMED = "tileConfirmed";
const VAR_TIER = "tileTier";
const VAR_TILE_MIN = "minTile";
const VAR_TILE_MAX = "maxTile";
//#endregion

//#region Vibrations
const VIBRATION_PLAY = [150, 50,20];
const VIBRATION_TILE_DRAG_START = [10];
const VIBRATION_TILE_DRAG_END = [10];
const VIBRATION_TILE_CONFIRMED = [100, 50,50, 50,30, 50,10];
//#endregion