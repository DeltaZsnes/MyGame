const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");

let touchProgram = null;
let waterProgram = null;
let vertexPositionBuffer = null;
let vertexPositionList = null;

let vertexPositionLocation = null;
let backgroundTextureLocation = null;
let waterTextureLocation = null;

let oldTime = null;
let waterTextureFront = null;
let waterTextureBack = null;
let backgroundTexture = null;
let frameBuffer = null;

let framebufferX = null;
let fbTextureX = null;

let mouse = {};

const makeProgram = (vsSource, fsSource) => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(vertexShader);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(fragmentShader);
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    return shaderProgram;
};

const makeProgramTouch = () => {
    const vsSource = `
attribute vec4 vertexPosition;
varying vec2 st;

void main(void) {
  gl_Position = vertexPosition;
  st = vertexPosition.st * 0.5 + vec2(0.5, 0.5);
}
`;

    const fsSource = `
precision mediump float;
varying vec2 st;
uniform sampler2D waterTexture;
uniform vec2 mousePosition;

void main(void) {
    float s = 0.0005;
    vec4 outgoing = texture2D(waterTexture, st);
    vec4 incoming = vec4(0, 0, 0, 0);
    incoming += texture2D(waterTexture, st + vec2(+s, +0));
    incoming += texture2D(waterTexture, st + vec2(-s, +0));
    incoming += texture2D(waterTexture, st + vec2(+0, +s));
    incoming += texture2D(waterTexture, st + vec2(+0, -s));
    vec4 c = incoming * 0.5 - outgoing;
    c = c * 0.99;

    if(distance(st, mousePosition) <= 0.1){
        c = vec4(1.0, 0.0, 0.0, 1.0);
    }

    gl_FragColor = vec4(
        clamp(c.r, -5.0, +5.0),
        clamp(c.g, 0.0, 1.0),
        clamp(c.b, 0.0, 1.0),
        1.0
    );
}
`;

    return makeProgram(vsSource, fsSource);
};

const makeProgramWater = () => {
    const vsSource = `
attribute vec4 vertexPosition;
varying vec2 st;

void main(void) {
    gl_Position = vertexPosition;
    st = vertexPosition.st * 0.5 + vec2(0.5, 0.5);
}
`;

    const fsSource = `
precision mediump float;
varying vec2 st;
uniform sampler2D waterTexture;
uniform sampler2D backgroundTexture;

void main(void) {
    vec4 water = texture2D(waterTexture, st);
    vec4 background = texture2D(backgroundTexture, st + vec2(water.r, water.r) * 0.1);
    gl_FragColor = background;
    // gl_FragColor = water;
}
`;

    return makeProgram(vsSource, fsSource);
};

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
const loadTexture = (imageUrl) => {
    return new Promise((resolve, _) => {
        const image = new Image();

        image.onload = function () {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            // gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            resolve(texture);
        };

        image.src = imageUrl;
    });
}

const makeDynamicTexture = () => {
    const size = 512;
    const data = new Float32Array(new Array(size * size * 4));
    
    for(let i = 0; i<data.length; i += 4){
        data[i + 0] = 0.0;
        data[i + 1] = 0.0;
        data[i + 2] = 0.0;
        data[i + 3] = 1.0;
    }

    gl.getExtension('OES_texture_float'); // enables floating point textures
    gl.getExtension('OES_texture_float_linear'); // enables floating linear mip map
    
    const dynamicTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dynamicTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return dynamicTexture;
};

const init = async () => {
    backgroundTexture = await loadTexture("background.jpg");

    touchProgram = {};
    touchProgram.program = makeProgramTouch();
    touchProgram.vertexPositionLocation = gl.getAttribLocation(touchProgram.program, "vertexPosition");
    touchProgram.waterTextureLocation = gl.getUniformLocation(touchProgram.program, "waterTexture");
    touchProgram.mousePositionLocation = gl.getUniformLocation(touchProgram.program, "mousePosition");

    waterProgram = {};
    waterProgram.program = makeProgramWater();
    waterProgram.vertexPositionLocation = gl.getAttribLocation(waterProgram.program, "vertexPosition");
    waterProgram.waterTextureLocation = gl.getUniformLocation(waterProgram.program, "waterTexture");
    waterProgram.backgroundTextureLocation = gl.getUniformLocation(waterProgram.program, "backgroundTexture");

    vertexPositionList = new Float32Array([
        -1.0, -1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, +1.0, 0.0,
    ]);
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositionList, gl.STATIC_DRAW);

    waterTextureBack = makeDynamicTexture();
    waterTextureFront = makeDynamicTexture();
    frameBuffer = gl.createFramebuffer();

    document.addEventListener('mousedown', (e) => {
        mouse.touch = true;
        mouse.x = e.x;
        mouse.y = e.y;
    });
    document.addEventListener('mouseup', (e) => {
        mouse.touch = false;
    });
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    document.addEventListener('touchstart', (e) => {
        mouse.touch = true;
        mouse.x = e.x;
        mouse.y = e.y;
    });
    document.addEventListener('touchend', (e) => {
        mouse.touch = false;
    });
    document.addEventListener('touchmove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
};

const render = () => {
    let newTime = performance.now();
    // console.log(1000.0/(newTime - oldTime));
    oldTime = newTime;

    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, waterTextureBack, 0);
        gl.useProgram(touchProgram.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(touchProgram.waterTextureLocation, 0);
        gl.bindTexture(gl.TEXTURE_2D, waterTextureFront);

        gl.uniform2f(touchProgram.mousePositionLocation, +mouse.x / 512.0, 1.0 - mouse.y / 512.0);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enableVertexAttribArray(touchProgram.vertexPositionLocation);
        gl.vertexAttribPointer(touchProgram.vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionList.length / 3);
    }

    let waterTextureTemp = waterTextureBack;
    waterTextureBack = waterTextureFront;
    waterTextureFront = waterTextureTemp;

    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(waterProgram.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(waterProgram.waterTextureLocation, 0);
        gl.bindTexture(gl.TEXTURE_2D, waterTextureFront);

        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(waterProgram.backgroundTextureLocation, 1);
        gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enableVertexAttribArray(waterProgram.vertexPositionLocation);
        gl.vertexAttribPointer(waterProgram.vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionList.length / 3);
    }

    window.requestAnimationFrame(render);
};

const runAsync = async () => {
    await init();
    window.requestAnimationFrame(render);
};

runAsync();
