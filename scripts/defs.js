//#region Constants
const DEV_MODE = true;          //--- When true and when running locally, dev mode will be active
const DEV_FOREVER_LOAD = false; //--- When true, loading screen will remain stuck forever

const REVEAL_BY_TIERS = false;  //--- True to reveal tiles in batches based on unlocked tiers (see TIERS variable below)
const FORCED_START = [];        //--- When defined, all new tiles will start on this position instead of the one configured in ORIGIN_POSITIONS
const TILE_DRAG_SNAP = true;    //--- Snap tiles to grid even when dragging the tile
const DEFAULT_ZOOM = 1;         //--- Default view box zoom

const CONFIRMATION_MOVE_DURATION = 1.5; //--- How long will camera take to focus on confirmed tile. Use 0 to disable the effect.
//#endregion

//#region Tiles
//--- Target positions of individual tiles. Imported from Google Sheets.
const TARGET_POSITIONS = new Map([
    ["tile15", [-2,2]],	["tile10", [-2,1]],	["tile19", [-2,0]],		
    ["tile17", [-1,2]],	["tile06", [-1,1]],	["tile11", [-1,0]],		
    ["tile07", [0,2]],	["tile03", [0,1]],	["tile01", [0,0]],	["tile12", [0,-1]],	["tile18", [0,-2]],
    ["tile13", [1,2]],	["tile21", [1,1]],	["tile02", [1,0]],	["tile04", [1,-1]],	["tile16", [1,-2]],
    ["tile14", [2,2]],	["tile08", [2,1]],	["tile05", [2,0]],	["tile09", [2,-1]],	["tile20", [2,-2]],
]);

//--- Starting positions of individual tiles. Imported from Google Sheets.
const ORIGIN_POSITIONS = new Map([								
    ["tile20", [-4,1]],					
    ["tile15", [-3,-1]],			
["tile14", [-2,3]],				["tile04", [-2,-1]],	["tile10", [-2,-2]],	["tile17", [-2,-3]],	
        ["tile06", [-1,-2]],		
["tile16", [0,4]],				["tile01", [0,0]],			["tile14", [0,-3]],	
["tile12", [1,4]],	["tile03", [1,3]],							
["tile07", [2,4]],			["tile02", [2,1]],					
["tile21", [3,3]],		["tile05", [3,1]],					
["tile11", [4,4]],	["tile09", [4,3]],	["tile19", [4,2]],	["tile08", [4,1]],	["tile13", [4,0]],	["tile18", [4,-1]],			
]);

//--- Unlock tiers. Imported from Google Sheets.
const TIERS = [
    2,
    5,
    9,
    14,
    20,
    21,
]
//#endregion

//#region Elements
const ID_TUTORIAL_VIEW = "tutorialView";
const ID_TUTORIAL_TILE = "tutorialTile";
const GAME_STATE_DEFAULT = "gameStateDefault";
const GAME_STATE_MOVE = "gameStateMove";
//#endregion

//#region Events
const EVENT_GAME_INIT = "GameInit";
const EVENT_GAME_DRAG_START = "GameDragStart";
const EVENT_GAME_DRAG = "GameDrag";
const EVENT_GAME_DRAG_END = "GameDragEnd";
const EVENT_TILE_CONFIRMED = "TileConfirmed";
//#endregion