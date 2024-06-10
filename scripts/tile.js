var Tile = new function()
{
    const INERTIA_DEFAULT = 0.02;

    const ID_TILE_AREA = "tileArea";
    const ID_TILE_CONTENT = "tileContent";
    const ID_TILE_TARGET = "tileHint";
    
    const CLASS_TILE_CURRENT = "tileCurrent";
    const CLASS_TILE_CONFIRMED = "tileConfirmed";
    
    const TILE_STATE_EDITABLE = "tileStateEditable";
    const TILE_STATE_EDITING = "tileStateEditing";
    const TILE_STATE_CONFIRMED = "tileStateConfirmed";

    const FIRST_TILE = "tile02";

    var m_CurrentTile = null;
    var m_SelectedTile = null;
    var m_Tiles = [];
    var m_TilesZSorted = [];
    var m_ClickTilePos = [];
    var m_OccupiedCoords = [];
    var m_CoordRange = {minX: 0, maxX: 0, minY: 0, maxY: 0};
    var m_TargetPos = [];
    var m_TimePrev = 0;
    var m_TilesElement = null;
    var m_TileHint = null;
    var m_Snapped = false;
    var m_First = false;
    var m_Sort = "";

    this.GetSelected = function()
    {
        return m_SelectedTile;
    }

    this.SetSelected = function(ev)
    {
        m_SelectedTile = null;

        //--- Ignore the first drag, we assume that the player wanted to drag the camera
        if (!m_First && (!Debug.IsDev() || !Debug.SkipIntro()))
        {
            m_First = true;
            return;
        }

        let element = Game.GetSVGDoc().elementFromPoint(ev.clientX, ev.clientY);
        while (element)
        {
            if (element.classList.contains("tile") && !element.getAttribute(VAR_CONFIRMED))
            {
                m_SelectedTile = element;
                break;
            }
    
            element = element.parentElement;
        }
    }

    this.RevealNextTile = function()
    {
        return RevealNextTile();
    }

    this.GetCurrentTile = function()
    {
        return m_CurrentTile;
    }

    this.GetSelectedTile = function()
    {
        return m_SelectedTile;
    }

    this.RemoveCurrentTile = function()
    {
        SetCurrentTile(null);
    }

    this.GetTiles = function()
    {
        return m_Tiles;
    }

    window.addEventListener(EVENT_GAME_INIT, () =>
    {
        m_TilesElement = Game.GetSVGDoc().getElementById(ID_TILES_ELEMENT);
        m_TileHint = Game.GetSVGDoc().getElementById(ID_TILE_TARGET);

        const gridLines = Game.GetSVGDoc().getElementById("gridLines");

        let i = 0;
        for (let tileID of TARGET_POSITIONS.keys())
        {
            let tile = Game.GetSVGDoc().getElementById(tileID);
    
            //--- Get target position
            let targetPosition = TARGET_POSITIONS.get(tileID);
            tile.setAttribute(VAR_GRID_TARGET_X, targetPosition[0]);
            tile.setAttribute(VAR_GRID_TARGET_Y, targetPosition[1]);

            m_CoordRange.minX = Math.min(m_CoordRange.minX, targetPosition[0]);
            m_CoordRange.maxX = Math.max(m_CoordRange.maxX, targetPosition[0]);
            m_CoordRange.minY = Math.min(m_CoordRange.minY, targetPosition[1]);
            m_CoordRange.maxY = Math.max(m_CoordRange.maxY, targetPosition[1]);
    
            //--- Get origin position
            let originPosition = ORIGIN_POSITIONS.get(tileID);
            if (!originPosition)
            {
                alert("Origin position for \"" + tileID + "\" not defined in ORIGIN_POSITIONS!");
                continue;
            }
            let gridX = originPosition[0];
            let gridY = originPosition[1];
    
            if (FORCED_START.length == 2 && !tile.getAttribute(VAR_CONFIRMED))
            {
                gridX = FORCED_START[0];
                gridY = FORCED_START[1];
            }

            if (tile.getAttribute(VAR_CONFIRMED))
                SetElementVisible(tile, true);

            SetTilePos(tile, gridX, gridY);
            EvaluateTile(tile, false);
            CreateGridSquare(targetPosition, gridLines, "grid_" + targetPosition);
    
            m_Tiles[i] = tile; //--- Must be called after SetTilePos(), otherwise the tile will think it's already occupied
            m_TilesZSorted[i] = tile;
            i++;
        }
        m_Tiles.sort((a, b) => parseInt(a.getAttribute("tileId")) - parseInt(b.getAttribute("tileId")));

        //--- Hint
        const tileHint = Game.GetSVGDoc().getElementById("tileHint");
        CreateGridSquare([0,0], tileHint, "", "");
        CreateGridSquare([0,0], tileHint, "", "animTileHint");

        //--- Cheats
        Game.GetSVG().addEventListener("keydown", OnKeyDown);
        Game.GetSVG().getElementById("cheatRevealAll").addEventListener("click", CheatRevealAll);

        requestAnimationFrame(OnEachFrame);

        SetElementVisible(m_TileHint, true);
        //RevealNextTile();
    });

    function CreateGridSquare(targetPosition, parent, idAttribute, classAttribute = "hidden gridTile")
    {
        const points = GetGridPos(targetPosition, 1, 0)
            + GetGridPos(targetPosition, 1, 1)
            + GetGridPos(targetPosition, 0, 1)
            + GetGridPos(targetPosition, 0, 0)
            + GetGridPos(targetPosition, 1, 0);

        const gridTile = CreateElement("polyline", parent, [
            ["id", idAttribute],
            ["points", points],
            ["class", classAttribute]
        ], true);
        return gridTile;
    }

    function GetGridPos(pos, offsetX, offsetY)
    {
        //--- 0.94 makes it match the image size, and prevents flickering on mobile when changing zoom
        const transform = new DOMPointReadOnly(pos[0] + offsetX * 0.94, pos[1] + offsetY * 0.94).matrixTransform(ISO_MATRIX);
        return (pos[0] + transform.x) + "," + (pos[1] + transform.y) + " ";
    }

    window.addEventListener(EVENT_INTRO, () =>
    {
        let currentTile = Game.GetSVGDoc().getElementById(FIRST_TILE);
        SetCurrentTile(currentTile);
    });

    window.addEventListener(EVENT_GAME_DRAG_START, (ev) =>
    {
        if (!m_SelectedTile)
            return;

        m_TargetPos = [];

        m_ClickTilePos = [parseInt(m_SelectedTile.getAttribute("x")), parseInt(m_SelectedTile.getAttribute("y"))];
        SetTileState(m_SelectedTile, TILE_STATE_EDITING);

        m_SelectedTile.querySelector("#tileContent").classList.remove("tileFadeIn");

        //Sound.Play("audioTileDragStart");
        Vibrate(VIBRATION_TILE_DRAG_START);
    });

    window.addEventListener(EVENT_GAME_DRAG, (ev) =>
    {
        if (!m_SelectedTile)
            return;

        DragTile(ev, TILE_DRAG_SNAP);
    });

    window.addEventListener(EVENT_GAME_DRAG_END, (ev) =>
    {
        if (!m_SelectedTile)
            return;

        DragTile(ev, true);
        let tile = m_SelectedTile;
        m_SelectedTile = null;
        
        let isConfirmed = EvaluateTile(tile, true);
        UpdateTiles();

        if (isConfirmed)
        {
            AnimateTile(tile, true);

            Vibrate(VIBRATION_TILE_CONFIRMED);
        }
        else
        {
            //Sound.Play("audioTileDragEnd");
            Vibrate(VIBRATION_TILE_DRAG_END);
        }
    });

    function OnKeyDown(ev)
    {
        //--- Cheat combination
        if (!ev.ctrlKey || !ev.shiftKey)
            return;

        if (ev.key == " ")
        {
            //--- [Space] Auto-place next tile
            for (let i = 0; i < m_Tiles.length; i++)
            {
                if (m_Tiles[i].getAttribute(VAR_CONFIRMED) == null)
                {
                    SetTilePos(m_Tiles[i], m_Tiles[i].getAttribute(VAR_GRID_TARGET_X), m_Tiles[i].getAttribute(VAR_GRID_TARGET_Y));
                    EvaluateTile(m_Tiles[i], true);
                    break;
                }
            }
        }
        else if (ev.key == "~")
        {
            //--- [~] Skip to the last tile
            CheatRevealAll(true);
        }
        else if (ev.key == "F")
        {
            //--- [F] Skip to outro
            CheatRevealAll(false);
        }
        else if (ev.key == "X")
        {
            //--- [X] Toggle numbers
            SetStyleVariable("--display-numbers", "block");
        }
    }

    function OnEachFrame()
    {
        let timeNow = Date.now();
        let timeSlice = (timeNow - m_TimePrev) * INERTIA_DEFAULT;
        m_TimePrev = timeNow;

        if (m_CurrentTile && m_TargetPos.length > 0 && m_CurrentTile.getAttribute("x") != null)
        {
            let posX = m_CurrentTile.getAttribute("x");
            let posY = m_CurrentTile.getAttribute("y");

            if (Math.abs(posX - m_TargetPos[0]) > 0.001 || Math.abs(posY - m_TargetPos[1]) > 0.001)
            {
                posX = Lerp(posX, m_TargetPos[0], timeSlice);
                posY = Lerp(posY, m_TargetPos[1], timeSlice);

                m_CurrentTile.setAttribute("x", posX);
                m_CurrentTile.setAttribute("y", posY);

                UpdateTiles();
            }
         }
         
         requestAnimationFrame(OnEachFrame);
    }

    function DragTile(ev, snap)
    {
        let viewBox = Game.GetCurrentViewBox();
        let coef = Math.min((viewBox[2] / window.innerWidth), (viewBox[3] / window.innerHeight)); //--- I have no idea what I'm doing
        let posX = m_ClickTilePos[0] - (Game.GetClickPos()[0] - ev.clientX) * coef;
        let posY = m_ClickTilePos[1] - (Game.GetClickPos()[1] - ev.clientY) * coef;

        var gridTransform = new DOMPointReadOnly(posX, posY).matrixTransform(ISO_MATRIX.inverse());
        gridTransform.x = Math.round(gridTransform.x);
        gridTransform.y = Math.round(gridTransform.y);

        //--- Snap to grid
        if (snap > 0)
        {
            const gridTile = snap == 2 ? Game.GetSVGDoc().getElementById("grid_" + [gridTransform.x, gridTransform.y]) : null;
            if (snap == 1 || (gridTile && IsElementVisible(gridTile)))
            {
                if (SetTileTransform(m_SelectedTile, gridTransform))
                {
                    Sound.Play("audioTileSnapStart");
                    m_Snapped = true;
                }
                return;
            } 

            if (m_Snapped)
            {
                Sound.Play("audioTileSnapEnd");
                m_Snapped = false;
            }
        }

        //--- Free transform
        m_TargetPos[0] = posX;
        m_TargetPos[1] = posY;

        //--- Save grid coords, so we can snap back to them when hovering over occupied tile
        m_SelectedTile.setAttribute(VAR_GRID_X, gridTransform.x);
        m_SelectedTile.setAttribute(VAR_GRID_Y, gridTransform.y);

        if (snap == 0)
        {
            //--- Dragged tile always on top (can't be in OnGameDragStart, it prevents Drand and DragEnd events from firing in Android Firefox)
            m_TilesElement.appendChild(m_SelectedTile);
        }
        else
        {
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
            if (IsElementVisible(m_Tiles[i]) && m_Tiles[i].getAttribute(VAR_GRID_X) == gridTransform.x && m_Tiles[i].getAttribute(VAR_GRID_Y) == gridTransform.y)
            {
                //--- Return back to original position in case of collision with existing tile
                gridTransform.x = tile.getAttribute(VAR_GRID_X);
                gridTransform.y = tile.getAttribute(VAR_GRID_Y);
                break;
            }
        }

        //--- Exit if the position did not change
        if (tile.getAttribute(VAR_GRID_X) == gridTransform.x && tile.getAttribute(VAR_GRID_Y) == gridTransform.y)
            return false;
    
        //--- Save grid position
        tile.setAttribute(VAR_GRID_X, gridTransform.x);
        tile.setAttribute(VAR_GRID_Y, gridTransform.y);
    
        //--- Set screen position
        let gameTransform = gridTransform.matrixTransform(ISO_MATRIX);

        tile.setAttribute(VAR_TARGET_X, gameTransform.x);
        tile.setAttribute(VAR_TARGET_Y, gameTransform.y);

        if (tile == m_CurrentTile)
        {
            m_TargetPos[0] = gameTransform.x;
            m_TargetPos[1] = gameTransform.y;
        }
        else
        {
            tile.setAttribute("x", gameTransform.x);
            tile.setAttribute("y", gameTransform.y);
        }
    
        //Debug.Log(tile.id, gridTransform.x, gridTransform.y);
        //UpdateTiles();

        return true;
    }
    
    function UpdateTiles()
    {
        //--- Sort by Y coordinate
        m_TilesZSorted.sort((a, b) => parseInt(a.getAttribute("y")) - parseInt(b.getAttribute("y")));

        //--- Check for change
        const prevSort = m_Sort;
        m_Sort = "";
        for (let i = 0; i < m_TilesZSorted.length; i++)
        {
            m_Sort += m_TilesZSorted[i].getAttribute("tileId");
        }

        //--- No change, ignore
        if (m_Sort == prevSort)
            return;
    
        //--- Re-add in the sorted order
        for (let i = 0; i < m_TilesZSorted.length; i++)
        {
            m_TilesElement.appendChild(m_TilesZSorted[i]);
        }
    }
    
    function EvaluateTile(tile, isManual)
    {
        let isConfirmed = tile.getAttribute(VAR_CONFIRMED) != null;
        if (!isConfirmed && tile.getAttribute(VAR_GRID_X) == tile.getAttribute(VAR_GRID_TARGET_X) && tile.getAttribute(VAR_GRID_Y) == tile.getAttribute(VAR_GRID_TARGET_Y))
        {
            tile.setAttribute(VAR_CONFIRMED, true);
            SetTileState(tile, TILE_STATE_CONFIRMED);
            tile.classList.add(CLASS_TILE_CONFIRMED);
            m_OccupiedCoords.push([parseInt(tile.getAttribute(VAR_GRID_TARGET_X)), parseInt(tile.getAttribute(VAR_GRID_TARGET_Y))]);
            
            //--- Adjust picture position
            let tilePicture = tile.getElementById(ID_TILE_CONTENT);
            const offsetX = -0.5 * parseInt(getComputedStyle(tilePicture).getPropertyValue("--tile-width"));
            const offsetY = -0.5 * parseInt(getComputedStyle(tilePicture).getPropertyValue("--tile-height"));
            tilePicture.setAttribute("transform",`translate(${offsetX},${offsetY})`);

            //--- Hide tile hint (and remove its animation, so it will be restarted once it's added again)
            SetElementVisible(m_TileHint, false);
            m_TileHint.classList.remove("animTileHintDelayed");
            
            //--- Hide tile-specific elements
            let elements = Game.GetSVGDoc().getElementsByClassName("unlock");
            for (let i = 0; i < elements.length; i++)
            {
                SetElementVisible(elements[i], false);
            }

            //--- Send custom event
            let ev = new CustomEvent(EVENT_TILE_CONFIRMED,{detail: {
                tile: tile,
                isLast: tile == m_Tiles[m_Tiles.length - 1],
                isManual: isManual
            }});
            window.dispatchEvent(ev);

            m_Snapped = false;
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
        let tilePicture = tile.getElementById(ID_TILE_CONTENT);
        if (tilePicture == null)
            return;

        if (animate)
            tilePicture.classList.add("animTileConfirmed");
        else
            tilePicture.classList.remove("animTileConfirmed");
    }
    
    function SetTileState(tile, state)
    {
        let tileArea = tile.getElementById(ID_TILE_AREA);
        tileArea.setAttribute("class", state);
    }

    function SetCurrentTile(tile)
    {
        //--- Unmark the previous current tile
        if (m_CurrentTile)
        {
            AnimateTile(m_CurrentTile, false);
            m_CurrentTile.classList.remove(CLASS_TILE_CURRENT);
            m_CurrentTile = null;
        }
        
        m_CurrentTile = tile;
        m_TargetPos = [];

        if (!m_CurrentTile)
            return;
        
        SetElementVisible(m_CurrentTile, true);
        m_CurrentTile.classList.add(CLASS_TILE_CURRENT);
        
        //--- Update tile hint's position
        const targetX = m_CurrentTile.getAttribute(VAR_GRID_TARGET_X);
        const targetY = m_CurrentTile.getAttribute(VAR_GRID_TARGET_Y);
        const transform = new DOMPointReadOnly(targetX, targetY).matrixTransform(ISO_MATRIX);
        m_TileHint.setAttribute("style", `transform: translate(${transform.x}px, ${transform.y}px)`);
        SetElementVisible(m_TileHint, true);
        
        //--- Show tile-specific elements
        let elements = Game.GetSVGDoc().getElementsByClassName("unlock");
        for (let i = 0; i < elements.length; i++)
        {
            let min = elements[i].getAttribute(VAR_TILE_MIN);
            let max = elements[i].getAttribute(VAR_TILE_MAX);

            SetElementVisible(elements[i], (min == null || index >= min) && (max == null || index <= max));
        }

        const id = m_Tiles.indexOf(m_CurrentTile);
        if (id != 1) //--- Don't delay the first tile
        {
            //--- Show tile hint for subsequent tiles only after a delay
            if (id == m_Tiles.length - 1)
                m_TileHint.classList.add("animTileHintLast");
            else
                m_TileHint.classList.add("animTileHintDelayed");

            //--- Fade in the tile (not for the first one)
            m_CurrentTile.querySelector("#tileContent").classList.add("tileFadeIn");
        }

        //--- Update grid
        for (let x = m_CoordRange.minX; x <= m_CoordRange.maxX; x++)
        {
            for (let y = m_CoordRange.minY; y <= m_CoordRange.maxY; y++)
            {
                var showTile = false;
                for (let i = 0; i < m_OccupiedCoords.length; i++)
                {
                    if (x == m_OccupiedCoords[i][0] && y == m_OccupiedCoords[i][1])
                    {
                        //--- Tile already occupied, don't show its grid
                        showTile = false;
                        break;
                    }

                    const disX = Math.abs(x - m_OccupiedCoords[i][0]);
                    const disY = Math.abs(y - m_OccupiedCoords[i][1]);
                    showTile |= disX + disY < 2;
                }

                const gridTile = Game.GetSVGDoc().getElementById("grid_" + [x, y]);
                if (gridTile)
                    SetElementVisible(gridTile, showTile);
            }
        }
    }

    function RevealNextTile()
    {
        //--- Show tile
        for (let i = 0; i < m_Tiles.length; i++)
        {
            //--- Reveal the next tile in line, one by one
            if (!IsElementVisible(m_Tiles[i]))
            {
                SetCurrentTile(m_Tiles[i]);
                return m_Tiles[i];
            }
        }
        return null;
    }

    function CheatRevealAll(leaveLast = false)
    {
        let maxIndex = m_Tiles.length;
        if (leaveLast)
            maxIndex--;

        SetCurrentTile(null); //--- Prevent position lerping of the current tile
        for (let i = 0; i < maxIndex; i++)
        {
            if (m_Tiles[i].getAttribute(VAR_CONFIRMED) == null)
            {
                SetElementVisible(m_Tiles[i], true);
                SetTilePos(m_Tiles[i], m_Tiles[i].getAttribute(VAR_GRID_TARGET_X), m_Tiles[i].getAttribute(VAR_GRID_TARGET_Y));
                EvaluateTile(m_Tiles[i], i == m_Tiles.length - 1);
            }
        }
        RevealNextTile();
        UpdateTiles();
    }
}