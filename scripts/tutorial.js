var Tutorial = new function()
{
    function UpdateTileTutorial()
    {
        //--- Show only when the viuew revealed target tile position
        SetElementVisible(Game.GetSVGDoc().getElementById("tutorialTileTouch"), Camera.GetViewBox().y > -700);
    }

    function OnDragStart(ev)
    {
        if (Tile.GetSelectedTile() == null)
            return;

        //--- Reveal tile drag indicator once the player starts dragging the tile
        SetElementVisible(Game.GetSVGDoc().getElementById("tutorialTileTouch"), false);
        window.removeEventListener(EVENT_GAME_DRAG_START, OnDragStart);
        window.removeEventListener(EVENT_GAME_DRAG, UpdateTileTutorial);
    }

    function OnTileConfirmed()
    {
        //--- Hide all tutorials once the first tile is confirmed
        SetElementVisible(Game.GetSVGDoc().getElementById("tutorialBack"), false);
        SetElementVisible(Game.GetSVGDoc().getElementById("tutorialFront"), false);

        window.removeEventListener(EVENT_TILE_CONFIRMED, OnTileConfirmed);
    }

    window.addEventListener(EVENT_INTRO, () =>
    {
        SetElementVisible(Game.GetSVGDoc().getElementById("tutorialBack"), true);
        SetElementVisible(Game.GetSVGDoc().getElementById("tutorialFront"), true);

        window.addEventListener(EVENT_GAME_DRAG_START, OnDragStart);
        window.addEventListener(EVENT_TILE_CONFIRMED, OnTileConfirmed);
        window.addEventListener(EVENT_GAME_DRAG, UpdateTileTutorial);
    });
}