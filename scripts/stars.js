var STAR_LAYER_COUNT = 3;
var STAR_COUNT = 80;

var m_Sky = document.getElementById("sky");

for (var s = 0; s < STAR_LAYER_COUNT; s++)
{
    let stars = CreateElement("svg", m_Sky, [["class", "stars"], ["width", "100%"], ["height","100%"], ["preserveAspectRatio", "none"]]);
    for (var i = 0; i < STAR_COUNT; i++)
    {
        let posX = Math.round(Math.random() * 10000) / 100 + "%";
        let posY = Math.round(Math.random() * 10000) / 100 + "%";
        let radius = Math.round((Math.random() + 0.5) * 10) / 10;
        let star = CreateElement("circle", stars, [["class", "star"], ["cx", posX], ["cy", posY], ["r", radius]]);
    }
}

// .stars-wrapper
// 	- for (var s = 0; s < 3; ++s)
// 		svg.stars(width="100%", height="100%", preserveAspectRatio="none")
// 			- for (var i = 0; i < 200; ++i)
// 				- cx = Math.round(Math.random() * 10000) / 100 + '%';
// 				- cy = Math.round(Math.random() * 10000) / 100 + '%';
// 				- r = Math.round((Math.random() + 0.5) * 10) / 10;
// 				circle.star(cx=cx, cy=cy, r=r)
// 	svg.extras(width="100%", height="100%", preserveAspectRatio="none")
// 		defs
// 			radialGradient#comet-gradient(, cx="0", cy=".5", r="0.5")
// 				stop(offset="0%", stop-color="rgba(255,255,255,.8)")
// 				stop(offset="100%", stop-color="rgba(255,255,255,0)")
// 		g(transform="rotate(-135)")
// 			ellipse.comet.comet-a(
// 				fill="url(#comet-gradient)",
// 				cx="0",
// 				cy="0",
// 				rx="150",
// 				ry="2"
// 			)
// 		g(transform="rotate(20)")
// 			ellipse.comet.comet-b(
// 				fill="url(#comet-gradient)",
// 				cx="100%",
// 				cy="0",
// 				rx="150",
// 				ry="2"
// 			)
// 		g(transform="rotate(300)")
// 			ellipse.comet.comet-c(
// 				fill="url(#comet-gradient)",
// 				cx="40%",
// 				cy="100%",
// 				rx="150",
// 				ry="2"
// 			)
