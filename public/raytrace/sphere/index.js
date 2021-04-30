const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");
let vertexShader = null;
let fragmentShader = null;
let shaderProgram = null;

let vertexPositionBuffer = null;
let vertexPositionLocation = null;
let vertexPositionList = null;

let spherePositionList = null;
let sphereColorList = null;
let spherePositionLocation = null;
let sphereColorLocation = null;

let oldTime = null;
let mouseDown = false;
let mousePositionOld = null;

let keyMap = {};

const vsSource = `
attribute vec4 vertexPosition;
varying vec2 st;

void main(void) {
  gl_Position = vertexPosition;
  st = vertexPosition.st;
}
`;

const fsSource = `
#define sphereCount 5
#define focalLength 4
#define rayCountMax 1

precision mediump float;
uniform vec4 spherePosition[sphereCount];
uniform vec4 sphereColor[sphereCount];
uniform vec3 cameraPosition[1];
uniform mat3 cameraRotation[1];
varying vec2 st;

void main(void) {
    vec3 sunPosition = spherePosition[0].xyz;
    float sunIntensity = spherePosition[0].w;

    vec3 rayPosition;
	vec3 rayDirection;
	int rayCount = 0;

    vec4 background = vec4(0.1, 0.2, 0.3, 1.0);
    vec4 rayColor = background;

    rayPosition = cameraPosition[0];
	rayDirection = cameraRotation[0] * vec3(st, focalLength);
    rayCount++;

    for(int sphereIndex = 0; sphereIndex < sphereCount; sphereIndex++)
	{
        vec3 position = spherePosition[sphereIndex].xyz;
        float radius = spherePosition[sphereIndex].w;
        vec4 color = sphereColor[sphereIndex];
        float a = dot(rayDirection, rayDirection);
        vec3 f = rayPosition - position;
		float b = dot(2.0 * rayDirection, f);
		float c = dot(f, f) - (radius * radius);
		float d = (b * b) - 4.0 * a * c;
		float e = sqrt(d);
		float t0 = (-b + e) / (2.0 * a);
		float t1 = (-b - e) / (2.0 * a);

        float t = min(t0, t1);
        vec3 hitPosition = rayPosition + rayDirection * t;
        float distanceSunHit = distance(sunPosition, hitPosition);

        if(t >= 0.0){
            rayColor = rayColor + color;
        }
    }

    gl_FragColor = rayColor;
}
`;

const init = () => {
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(vertexShader);
    }

    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(fragmentShader);
    }

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    vertexPositionLocation = gl.getAttribLocation(shaderProgram, "vertexPosition");
    spherePositionLocation = gl.getUniformLocation(shaderProgram, "spherePosition");
    sphereColorLocation = gl.getUniformLocation(shaderProgram, "sphereColor");
    cameraPositionLocation = gl.getUniformLocation(shaderProgram, "cameraPosition");
    cameraRotationLocation = gl.getUniformLocation(shaderProgram, "cameraRotation");

    vertexPositionList = new Float32Array([
        -1.0, -1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, +1.0, 0.0,
    ]);
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositionList, gl.STATIC_DRAW);

    spherePositionList = new Float32Array([
        +0.0, +20.0, +0.0, +1.0,
        +0.0, 0.0, +0.0, 1.0,
        +1.0, 0.0, +1.0, 1.0,
        +2.0, 0.0, +2.0, 1.0,
        +0.0, -1005.0, +0.0, 1000.0,
    ]);

    sphereColorList = new Float32Array([
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.1, 0.1, 0.1, 1.0,
    ]);

    cameraPosition = vec3.fromValues(0, 0, -20);
    cameraRotation = mat3.create();
    
    attachKeys();
};

const attachKeys = () => {
    document.addEventListener('keypress', (e) => {
        keyMap[e.key] = true;
    });
    document.addEventListener('keyup', (e) => {
        keyMap[e.key] = false;
    });
        
    document.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mousePositionOld = vec2.fromValues(e.x, e.y);
    });
    document.addEventListener('mouseup', (e) => {
        mouseDown = false;
    });
    document.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            let mousePositionNew = vec2.fromValues(e.x, e.y);
            let mouseDelta = vec2.create();
            vec2.sub(mouseDelta, mousePositionOld, mousePositionNew);
            let mouseVector = vec3.fromValues(-mouseDelta[0], mouseDelta[1], 1000.0);
            vec3.normalize(mouseVector, mouseVector);

            let globalForward = vec3.fromValues(0, 0, 1);
            let localForward = vec3.create();
            vec3.transformMat3(localForward, globalForward, cameraRotation);

            let q = quat.create();
            quat.rotationTo(q, globalForward, mouseVector);

            let r = mat3.create();
            mat3.fromQuat(r, q);
            mat3.mul(cameraRotation, cameraRotation, r);

            mousePositionOld = mousePositionNew;
        };
    });
};

const checkKeys = () => {
    if(keyMap["w"]){
        let v = vec3.fromValues(0, 0, +1);
        vec3.transformMat3(v, v, cameraRotation);
        vec3.add(cameraPosition, cameraPosition, v);
    }

    if(keyMap["s"]){
        let v = vec3.fromValues(0, 0, -1);
        vec3.transformMat3(v, v, cameraRotation);
        vec3.add(cameraPosition, cameraPosition, v);
    }

    if(keyMap["a"]){
        let v = vec3.fromValues(-1, 0, 0);
        vec3.transformMat3(v, v, cameraRotation);
        vec3.add(cameraPosition, cameraPosition, v);
    }

    if(keyMap["d"]){
        let v = vec3.fromValues(+1, 0, 0);
        vec3.transformMat3(v, v, cameraRotation);
        vec3.add(cameraPosition, cameraPosition, v);
    }
}

const render = () => {
    checkKeys();

    let newTime = performance.now();
    // console.log(1000.0/(newTime - oldTime));
    oldTime = newTime;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);

    gl.useProgram(shaderProgram);

    gl.enableVertexAttribArray(vertexPositionLocation);
    gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionList.length / 3);

    gl.uniform4fv(spherePositionLocation, spherePositionList);
    gl.uniform4fv(sphereColorLocation, sphereColorList);
    gl.uniform3fv(cameraPositionLocation, cameraPosition);
    gl.uniformMatrix3fv(cameraRotationLocation, false, cameraRotation);

    window.requestAnimationFrame(render);
};

init();
window.requestAnimationFrame(render);
