//#region Misc
function CreateElement(type, parent, params = [], isSVG = false)
{
    let nameSpace = isSVG ? "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml";
    let element = document.createElementNS(nameSpace, type);
    parent.appendChild(element);
    for (let i = 0; i < params.length; i++)
    {
        element.setAttribute(params[i][0], params[i][1]);
    }
    return element;
}

function SetElementVisible(element, isVisible)
{
    if (element == null)
    {
        console.warn("Attempting to set visibility to null element!");
        return;
    }
    
    if (isVisible)
        element.classList.remove("hidden");
    else
        element.classList.add("hidden");
}

function IsElementVisible(element)
{
    return !element.classList.contains("hidden");
}

function SetStyleVariable(name, value)
{
    document.querySelector(":root").style.setProperty(name, value);
    Game.GetSVGDoc().querySelector(":root").style.setProperty(name, value);
}

function Vibrate(pattern)
{
    const canVibrate = window.navigator.vibrate;
    if (canVibrate)
        window.navigator.vibrate(pattern);
}

function AnimateWords(element, delay = 0, interval = 0.1, className = "animatedText")
{
    let result = [];
    const segments = element.innerHTML.split(" ");
    let segment = null;
    element.innerHTML = "";
    for (let i = 0; i < segments.length; i++)
    {
        segment = CreateElement("span", element, [["class", className], ["style", `animation-delay: ${delay + interval * i}s`]]); //--- #TODO: Delay as param
        segment.innerHTML = segments[i] + "&nbsp;";
        result.push(segment);
    }
    return result;
}
function AnimateLetters(element, delay = 0, interval = 0.03, className = "animatedText")
{
    let result = [];
    let segment = null;
    const text = element.innerHTML;
    element.innerHTML = "";
    for (let i = 0; i < text.length; i++)
    {
        let style = `animation-delay: ${delay + interval * i}s;`;
        if (text[i] == " ")
            style += "padding-left: 0.3em;" //--- As whitespace is trimmed by default, add left padding to emulate it

        segment = CreateElement("span", element, [["class", className], ["style", style]]);
        segment.innerHTML = text[i];
        result.push(segment);
    }
    return result;
}

//#endregion

//#region Audio
function PlayAudio(name)
{
    //--- https://www.w3schools.com/JSREF/dom_obj_audio.asp
    let audioObject = document.getElementById(name);
    audioObject.load();
    audioObject.play();
}
//#endregion

//#region Math
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function Lerp(a, b, t)
{
    t = Clamp(t, 0, 1);
	return a * (1 - t) + (b * t);
}

function InvLerp(a, b, v)
{
	return Math.min(Math.max((v - a) / (b - a), 0), 1);
}
function Clamp(value, min, max)
{
    return Math.max(min, Math.min(max, value));
}

function SmoothStep(x)
{
	return x * x * (3 - 2 * x);
}

//--- https://easings.net/
function EaseInOutQuad(x)
{
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function EaseInOutCubic(x)
{
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function EaseInOutQuint(x)
{
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

function EaseInOutBack(x)
{
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    
    return x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

//#endregion