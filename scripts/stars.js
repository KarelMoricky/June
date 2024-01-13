var STAR_LAYER_COUNT = 3;
var STAR_COUNT = 80;

var m_Sky = document.getElementById("sky");

for (var s = 0; s < STAR_LAYER_COUNT; s++)
{
    let stars = CreateElement("svg", m_Sky, [["class", "stars"], ["width", "100%"], ["height","100%"], ["preserveAspectRatio", "none"]], true);
    for (var i = 0; i < STAR_COUNT; i++)
    {
        let posX = Math.round(Math.random() * 10000) / 100 + "%";
        let posY = Math.round(Math.random() * 10000) / 100 + "%";
        let radius = Math.round((Math.random() + 0.5) * 10) / 10;
        CreateElement("circle", stars, [["class", "star"], ["cx", posX], ["cy", posY], ["r", radius]], true);
    }
}