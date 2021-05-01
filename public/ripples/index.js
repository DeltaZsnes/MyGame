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

void main(void) {
    float s = 1.0 / 512.0;
    vec4 water = vec4(0, 0, 0, 0);
    water += texture2D(waterTexture, st + vec2(+s, +0));
    water += texture2D(waterTexture, st + vec2(-s, +0));
    water += texture2D(waterTexture, st + vec2(+0, +s));
    water += texture2D(waterTexture, st + vec2(+0, -s));
    // water += texture2D(waterTexture, st + vec2(-s, -s));
    // water += texture2D(waterTexture, st + vec2(+s, +s));
    // water += texture2D(waterTexture, st + vec2(-s, +s));
    // water += texture2D(waterTexture, st + vec2(+s, -s));
    // water = water / 4.0;
    gl_FragColor = water;

    if(distance(st, vec2(0.5,0.5)) <= 0.1){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
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
    vec4 background = texture2D(backgroundTexture, st);
    gl_FragColor = mix(background, water, 0.5);
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
            gl.generateMipmap(gl.TEXTURE_2D);
            resolve(texture);
        };

        image.src = imageUrl;
    });
}

const makeDynamicTexture = () => {
    const size = 512;
    const data = new Uint8Array(new Array(size * size * 4).fill(0));
    for(let i = 3; i<data.length; i+=4){
        data[i] = 255;
    }
    const dynamicTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dynamicTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
        console.log(e);
    });
    document.addEventListener('mouseup', (e) => {
    });
    document.addEventListener('mousemove', (e) => {
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
