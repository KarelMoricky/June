var Tile = new function()
{
    const ID_TILE_AREA = "tileArea";
    const ID_INTRO = "intro";
    //const ID_GRID = "grid";
    
    const CLASS_TILE_SHOWN = "tile";
    const CLASS_TILE_HIDDEN = "tileHidden";
    const CLASS_TILE_CONFIRMED = "tileConfirmed";
    
    const TILE_STATE_EDITABLE = "tileStateEditable";
    const TILE_STATE_EDITING = "tileStateEditing";
    const TILE_STATE_CONFIRMED = "tileStateConfirmed";

    //--- Classes
    const VAR_GRID_X = "gX";
    const VAR_GRID_Y = "gY";
    const VAR_TARGET_X = "tX";
    const VAR_TARGET_Y = "tY";
    const VAR_TARGET_CONFIRMED = "tileConfirmed";
    const VAR_TIER = "tileTier";
    
    //--- Grid
    const GRID_SIZE = 12;
    const ISO_SIZE = 140;
    const ISO_MATRIX = new DOMMatrixReadOnly()
        .rotate(30)
        .skewX(-30)
        .scale(1 * ISO_SIZE, 0.8602 * ISO_SIZE);

    var m_Selected;
    var m_Tiles = [];
    var m_TilesZSorted = [];
    var m_ClickTilePos = [];
    var m_ConfirmedCount = 0;
    var m_Tier = 0;
    // var m_Grid;
    // var m_GridDebug;

    this.GetSelected = function()
    {
        return m_Selected;
    }

    this.SetSelected = function(ev)
    {
        m_Selected = null;
        let element = Game.GetSVGDoc().elementFromPoint(ev.clientX, ev.clientY);
        while (element)
        {
            if (element.getAttribute("class") == "tile" && !element.getAttribute(VAR_TARGET_CONFIRMED))
            {
                m_Selected = element;
                break;
            }
    
            element = element.parentElement;
        }
    }
    
    window.addEventListener("GameInit", OnGameInit);
    window.addEventListener("GameDragStart", OnGameDragStart);
    window.addEventListener("GameDrag", OnGameDrag);
    window.addEventListener("GameDragEnd", OnGameDragEnd);

    function OnGameInit()
    {
        let i = 0;
        for (let tileID of TARGET_POSITIONS.keys())
        {
            let tile = Game.GetSVGDoc().getElementById(tileID)
    
            //--- Get target position
            let targetPosition = TARGET_POSITIONS.get(tileID);
            tile.setAttribute(VAR_TARGET_X, targetPosition[0]);
            tile.setAttribute(VAR_TARGET_Y, targetPosition[1]);
    
            //--- Get origin position
            let originPosition = ORIGIN_POSITIONS.get(tileID);
            if (!originPosition)
            {
                alert("Origin position for \"" + tileID + "\" not defined in ORIGIN_POSITIONS!");
                continue;
            }
            let gridX = originPosition[0];
            let gridY = originPosition[1];
    
            if (FORCED_START.length == 2 && !tile.getAttribute(VAR_TARGET_CONFIRMED))
            {
                gridX = FORCED_START[0];
                gridY = FORCED_START[1];
            }
    
            SetTilePos(tile, gridX, gridY);
            EvaluateTile(tile, false);
    
            m_Tiles[i] = tile; //--- Must be called after SetTilePos(), otherwise the tile will think it's already occupied
            m_TilesZSorted[i] = tile;
            i++;
        }
        m_Tiles.sort((a, b) => parseInt(a.getAttribute("tileId")) - parseInt(b.getAttribute("tileId")));
        UpdateTier();

        if (Debug.IsDev())
        {
            Game.GetSVG().addEventListener("keydown", OnKeyDown);
        }
        
        //--- Init grid
        // m_Grid = m_SvgDoc.getElementById(ID_GRID);
        // m_GridDebug = m_SvgDoc.getElementById("gridDebug");
        // CreateElement("circle", m_Game, [["r", 0.1], ["fill", "blue"]]);
        // for (let x = -GRID_SIZE / 2; x <= GRID_SIZE / 2; x++)
        // {
        //     for (let y = -GRID_SIZE / 2; y <= GRID_SIZE / 2; y++)
        //     {
        //         CreateElement("circle", m_Grid, [["cx", x], ["cy", y], ["r", 0.01], ["fill", "black"]]);
        //     }
        // }
    }

    function OnGameDragStart(ev)
    {
        if (!m_Selected)
            return;

        m_ClickTilePos = [parseInt(m_Selected.getAttribute("x")), parseInt(m_Selected.getAttribute("y"))];
        SetTileState(m_Selected, TILE_STATE_EDITING);
    }

    function OnGameDrag(ev)
    {
        if (!m_Selected)
            return;

        DragTile(ev, TILE_DRAG_SNAP);
    }

    function OnGameDragEnd(ev)
    {
        if (!m_Selected)
            return;

        DragTile(ev, true);
        let tile = m_Selected;
        m_Selected = null;
        
        let isConfirmed = EvaluateTile(tile, true);
        UpdateTiles();

        if (isConfirmed)
            AnimateTile(tile, true);
    }

    function OnKeyDown(ev)
    {
        if (ev.keyCode == 49)
        {
            //--- [1] Reveal all tiles
            m_ConfirmedCount = 1000;
            UpdateTier();
        }
        else if (ev.keyCode == 50)
        {
            //--- [2] Move all shown tiles to target coordinates
            let shownTiles = [];
            for (let i = 0; i < m_Tiles.length; i++)
            {
                if (m_Tiles[i].getAttribute("class") == CLASS_TILE_SHOWN)
                {
                    shownTiles.push(m_Tiles[i]);
                }
            }
            for (let i = 0; i < shownTiles.length; i++)
            {
                if (shownTiles[i].getAttribute("class") == CLASS_TILE_SHOWN)
                {
                    SetTilePos(shownTiles[i], shownTiles[i].getAttribute(VAR_TARGET_X), shownTiles[i].getAttribute(VAR_TARGET_Y));
                    EvaluateTile(shownTiles[i], false);
                }
                UpdateTier();
            }
        }
    }

    function DragTile(ev, snap)
    {
        let coef = Math.min((Game.GetViewBox()[2] / window.innerWidth), (Game.GetViewBox()[3] / window.innerHeight)); //--- I have no idea what I'm doing
        let posX = m_ClickTilePos[0] - (Game.GetClickPos()[0] - ev.clientX) * coef;
        let posY = m_ClickTilePos[1] - (Game.GetClickPos()[1] - ev.clientY) * coef;
    
        //--- Snap to grid
        var gridTransform = new DOMPointReadOnly(posX, posY).matrixTransform(ISO_MATRIX.inverse());
        if (snap)
        {
            gridTransform.x = Math.round(gridTransform.x);
            gridTransform.y = Math.round(gridTransform.y);
            SetTileTransform(m_Selected, gridTransform);
        }
        else
        {
            m_Selected.setAttribute("x", posX);
            m_Selected.setAttribute("y", posY);
            UpdateTiles();
        }
    }
    
    function SetTilePos(tile, gridX, gridY)
    {
        SetTileTransform(tile, new DOMPointReadOnly(gridX, gridY));
    }
    
    function SetTileTransform(tile, gridTransform)
    {
        //--- Check if some tile (including itself) already occupies the coordinates
        for (let i = 0; i < m_Tiles.length; i++)
        {
            if (m_Tiles[i].getAttribute("class") == CLASS_TILE_SHOWN && m_Tiles[i].getAttribute(VAR_GRID_X) == gridTransform.x && m_Tiles[i].getAttribute(VAR_GRID_Y) == gridTransform.y)
            {
                //--- Return back to original position in case of collision with existing tile
                gridTransform.x = tile.getAttribute(VAR_GRID_X);
                gridTransform.y = tile.getAttribute(VAR_GRID_Y);
                break;
            }
        }
    
        //--- Save grid position
        tile.setAttribute(VAR_GRID_X, gridTransform.x);
        tile.setAttribute(VAR_GRID_Y, gridTransform.y);
    
        //--- Set screen position
        let gameTransform = gridTransform.matrixTransform(ISO_MATRIX);
        tile.setAttribute("x", gameTransform.x);
        tile.setAttribute("y", gameTransform.y);
    
        Debug.Log(tile.id, gridTransform.x, gridTransform.y);
        UpdateTiles();
    }
    
    function UpdateTiles()
    {
        m_TilesZSorted.sort((a, b) => parseInt(a.getAttribute("y")) - parseInt(b.getAttribute("y")));
    
        for (let i = 0; i < m_TilesZSorted.length; i++)
        {
            Game.GetSVG().appendChild(m_TilesZSorted[i]);
            AnimateTile(m_TilesZSorted[i], false);
        }
    
        //--- Dragged tile always on top
        if (m_Selected)
            Game.GetSVG().appendChild(m_Selected);
    }
    
    function UpdateTier()
    {
        m_Tier = 0;
        for (let i = 0; i < TIERS.length; i++)
        {
            if (m_ConfirmedCount < TIERS[i])
                break;
    
            m_Tier = i + 1;
        }
    
        for (let i = 0; i < m_Tiles.length; i++)
        {
            if (REVEAL_BY_TIERS)
            {
                //--- Reveal multiple tiles according to their tier
                if (m_Tiles[i].getAttribute(VAR_TIER) <= m_Tier)
                    m_Tiles[i].setAttribute("class", CLASS_TILE_SHOWN);
                else
                    m_Tiles[i].setAttribute("class", CLASS_TILE_HIDDEN);
            }
            else
            {
                //--- Reveal the next tile in line, one by one
                if (m_Tiles[i].getAttribute("class") == CLASS_TILE_HIDDEN)
                {
                    m_Tiles[i].setAttribute("class", CLASS_TILE_SHOWN);
                    break;
                }
            }
        }
    
        //--- Reveal tier texts
        if (REVEAL_BY_TIERS)
        {
            var notes = m_Notes.children;
            for (var i = 0; i < notes.length; i++)
            {
                if (notes[i].getAttribute(VAR_TIER) == m_Tier)
                    notes[i].setAttribute("class", "");
                else
                    notes[i].setAttribute("class", "hidden");
            }
        }
    }
    
    function EvaluateTile(tile, isManual)
    {
        let isConfirmed = tile.getAttribute(VAR_TARGET_CONFIRMED) != null;
        if (!isConfirmed && tile.getAttribute(VAR_GRID_X) == tile.getAttribute(VAR_TARGET_X) && tile.getAttribute(VAR_GRID_Y) == tile.getAttribute(VAR_TARGET_Y))
        {
            tile.setAttribute(VAR_TARGET_CONFIRMED, true);
            SetTileState(tile, TILE_STATE_CONFIRMED);
            m_ConfirmedCount++;
    
            if (isManual)
            {
                UpdateTier();
                PlayAudio("audioTest1");
            }
    
            if (m_ConfirmedCount == 2)
            {
                //--- Hide tutorial
                let intro = Game.GetSVGDoc().getElementById(ID_INTRO);
                intro.setAttribute("class", "hidden");
    
                let tutorialView = Game.GetSVGDoc().getElementById(ID_TUTORIAL_VIEW);
                tutorialView.setAttribute("class", "hidden");
            
                let tutorialTile = Game.GetSVGDoc().getElementById(ID_TUTORIAL_TILE);
                tutorialTile.setAttribute("class", "hidden");
            }
            return true;
        }
        else
        {
            SetTileState(tile, TILE_STATE_EDITABLE);
            return false;
        }
    }
    
    function AnimateTile(tile, animate)
    {
        let tilePicture = tile.getElementById("tilePicture");
        if (animate)
            tilePicture.setAttribute("class", "animateTileConfirmed");
        else
            tilePicture.setAttribute("class", "");
    }
    
    function SetTileState(tile, state)
    {
        let tileArea = tile.getElementById(ID_TILE_AREA);
        tileArea.setAttribute("class", state);
    }
}