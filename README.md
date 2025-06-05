# threejs-vox-loader

A [Three.js](https://threejs.org/) loader for `.vox` files (from MagicaVoxel), designed for realistic rendering and correct voxel scene orientation.

![Comparison](docs/comparison.png)

## Features

* 🔧 **Optimized Meshes** – Builds efficient geometry for faster rendering and lower memory usage.
* 🌐 **PBR Materials** – Automatically applies `roughness` and `metalness` values from the `.vox` file for realistic surfaces.
* 💡 **Emissive Voxels with Lighting** – Converts emissive voxels into real-time `PointLight`s for dynamic scene illumination.
* 🎯 **Accurate Orientation** – Ensures models are correctly aligned in the Three.js coordinate system.
* 🧩 **Easy Integration** – Minimal setup required; simply load and add to your Three.js scene.
* 🏗️ **Multi-Object Scene Support** – Fully supports MagicaVoxel scenes composed of multiple models.
* 🧊 **Glass & Transparency Support** – Handles transparent voxels with proper material rendering.

## Installation

npm [threejs-vox-loader](https://www.npmjs.com/package/threejs-vox-loader)

```bash
npm install threejs-vox-loader
```

## Usage

```javascript
import { VOXLoader } from 'threejs-vox-loader';

const loader = new VOXLoader();
loader.load('path/to/model.vox', function (voxScene) {
    scene.add(voxScene);
});
```

## Options

Be aware that the material properties like roughness or metalness of MagicaVoxel behave differently in three.js

```javascript
new VOXLoader({
    defaultMaterialOptions: {
        flatShading: true,
        roughness: 0,
        metalness: 0
    },
    enableMetalness: true,
    enableRoughness: true,
    enableGlass: true,
    enableEmissive: true,
    lightIntensity: 10,
    lightDistance: 3,
    lightDecay: 2,
    useRectLights: false
});
```

| Property                             | Type    | Default Value                                       | Description                                                     |
|--------------------------------------|---------|-----------------------------------------------------|-----------------------------------------------------------------|
| `defaultMaterialOptions`             | Object  | `{ flatShading: true, roughness: 0, metalness: 0 }` | Default material settings for rendering.                        |
| `defaultMaterialOptions.flatShading` | Boolean | `true`                                              | Enables flat shading.                                           |
| `defaultMaterialOptions.roughness`   | Number  | `0`                                                 | Sets the surface roughness (0 = smooth, 1 = rough).             |
| `defaultMaterialOptions.metalness`   | Number  | `0`                                                 | Sets the surface metalness (0 = non-metal, 1 = fully metallic). |
| `enableMetalness`                    | Boolean | `true`                                              | Allows control over metalness property in materials.            |
| `enableRoughness`                    | Boolean | `true`                                              | Allows control over roughness property in materials.            |
| `enableGlass`                        | Boolean | `true`                                              | Enables glass-like material effects.                            |
| `enableEmissive`                     | Boolean | `true`                                              | Enables emissive (self-illuminating) material properties.       |
| `lightIntensity`                     | Number  | `10`                                                | Intensity of the scene's light source.                          |
| `lightDistance`                      | Number  | `3`                                                 | Distance at which the light has effect.                         |
| `lightDecay`                         | Number  | `2`                                                 | Light decay rate over distance.                                 |
| `useRectLights`                      | Boolean | `false`                                             | Use RectLights, see three.js docs                               |
