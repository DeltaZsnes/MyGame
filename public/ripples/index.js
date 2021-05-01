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
let waterTexture = null;
let backgroundTexture = null;
let frameBuffer = null;

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
  st = vertexPosition.st;
}
`;

    const fsSource = `
precision mediump float;
varying vec2 st;

void main(void) {
    if(distance(st, vec2(0,0)) <= 0.1){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }

    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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
    st = vertexPosition.st;
}
`;

    const fsSource = `
precision mediump float;
varying vec2 st;
uniform sampler2D backgroundTexture;
uniform sampler2D waterTexture;

void main(void) {
    vec4 background = texture2D(backgroundTexture, st);
    vec4 water = texture2D(waterTexture, st);
    gl_FragColor = mix(background, water, 0.5);
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

            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;

            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                null);

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                srcFormat, srcType, image);
            gl.generateMipmap(gl.TEXTURE_2D);

            resolve(texture);
        };

        image.src = imageUrl;
    });
}

const init = async () => {
    backgroundTexture = await loadTexture("background.jpg");

    touchProgram = makeProgramTouch();
    waterProgram = makeProgramWater();

    vertexPositionLocation = gl.getAttribLocation(touchProgram, "vertexPosition");
    waterTextureLocation = gl.getUniformLocation(waterProgram, "waterTexture");
    backgroundTextureLocation = gl.getUniformLocation(waterProgram, "backgroundTexture");

    vertexPositionList = new Float32Array([
        -1.0, -1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, +1.0, 0.0,
    ]);
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositionList, gl.STATIC_DRAW);

    waterTexture = gl.createTexture();
    let level = 0;
    gl.bindTexture(gl.TEXTURE_2D, waterTexture);
    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.generateMipmap(gl.TEXTURE_2D);

    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, waterTexture, level);

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
        gl.useProgram(touchProgram);

        gl.bindTexture(gl.TEXTURE_2D, waterTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enableVertexAttribArray(vertexPositionLocation);
        gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionList.length / 3);
    }

    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(waterProgram);

        gl.bindTexture(gl.TEXTURE_2D, waterTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
        gl.activeTexture(gl.TEXTURE1);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1i(waterTextureLocation, 0);
        gl.uniform1i(backgroundTextureLocation, 1);

        gl.enableVertexAttribArray(vertexPositionLocation);
        gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionList.length / 3);
    }

    window.requestAnimationFrame(render);
};

const runAsync = async () => {
    await init();
    window.requestAnimationFrame(render);
};

runAsync();
