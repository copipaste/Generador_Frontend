import { useMutation } from "@liveblocks/react";
import { nanoid } from "nanoid";
import { LayerType } from "~/types";

// Función principal para generar un proyecto Angular a partir del diseño actual
export const useAngularProjectGenerator = (roomName: string) => {
  const generateAngularProject = useMutation(async ({ storage }) => {
    try {
      // Obtener los datos del canvas
      const layers = storage.get("layers").toImmutable();
      const layerIdsArray = storage.get("layerIds").toImmutable();
      const canvasColor = storage.get("roomColor");
      
      // Convertir el mapa de capas a un objeto para JSON
      const layersObject: Record<string, any> = {};
      layers.forEach((layer, id) => {
        layersObject[id] = JSON.parse(JSON.stringify(layer));
      });
      
      const canvasData = {
        layers: layersObject,
        layerIds: layerIdsArray,
        roomColor: canvasColor,
        exportedAt: new Date().toISOString(),
        name: roomName
      };
      
      // Generar estructura de proyecto Angular
      const angularProject = {
        // Archivos de configuración
        'package.json': generatePackageJson(roomName),
        'angular.json': generateAngularJson(roomName),
        'tsconfig.json': generateTsConfig(),
        // Archivos de la aplicación
        'src/app/app.module.ts': generateAppModule(canvasData),
        'src/app/app.component.ts': generateAppComponent(canvasData),
        'src/app/app.component.html': generateAppTemplate(canvasData),
        'src/app/app.component.scss': generateAppStyles(canvasData),
        'src/styles.scss': generateGlobalStyles(canvasData),
        'src/index.html': generateIndexHtml(roomName),
        'src/main.ts': generateMainTs(),
        'src/environments/environment.ts': generateEnvironment(),
        'src/environments/environment.prod.ts': generateEnvironmentProd(),
        // README con instrucciones
        'README.md': generateReadme(roomName)
      };
      
      // Crear un archivo ZIP con todos los archivos
      const JSZip = await import('jszip').then(module => module.default);
      const zip = new JSZip();
      
      // Añadir archivos al ZIP
      Object.entries(angularProject).forEach(([path, content]) => {
        // Crear carpetas si es necesario
        const folders = path.split('/');
        let currentFolder = zip;
        
        if (folders.length > 1) {
          for (let i = 0; i < folders.length - 1; i++) {
            // Asegurarse de que folders[i] sea una cadena válida
            const folderName = folders[i];
            if (folderName) {
              currentFolder = currentFolder.folder(folderName) || currentFolder;
            }
          }
          const fileName = folders[folders.length - 1];
          if (fileName) {
            currentFolder.file(fileName, content);
          }
        } else {
          zip.file(path, content);
        }
      });
      
      // Generar el ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Descargar el archivo ZIP
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${roomName.replace(/\s+/g, '_')}_angular_project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Proyecto Angular generado con éxito. Descomprime el archivo y ejecuta "npm install" para instalar las dependencias.');
      
    } catch (error) {
      console.error("Error generando proyecto Angular:", error);
      alert("Error al generar el proyecto Angular. Por favor, intenta de nuevo.");
    }
  }, [roomName]);

  return generateAngularProject;
};

// Funciones auxiliares para generar archivos del proyecto Angular
const generatePackageJson = (projectName: string) => {
  return JSON.stringify({
    "name": projectName.toLowerCase().replace(/\s+/g, '-'),
    "version": "0.0.1",
    "scripts": {
      "ng": "ng",
      "start": "ng serve",
      "build": "ng build",
      "watch": "ng build --watch --configuration development",
      "test": "ng test"
    },
    "private": true,
    "dependencies": {
      "@angular/animations": "^17.0.0",
      "@angular/common": "^17.0.0",
      "@angular/compiler": "^17.0.0",
      "@angular/core": "^17.0.0",
      "@angular/forms": "^17.0.0",
      "@angular/platform-browser": "^17.0.0",
      "@angular/platform-browser-dynamic": "^17.0.0",
      "@angular/router": "^17.0.0",
      "rxjs": "~7.8.0",
      "tslib": "^2.3.0",
      "zone.js": "~0.14.2"
    },
    "devDependencies": {
      "@angular-devkit/build-angular": "^17.0.0",
      "@angular/cli": "^17.0.0",
      "@angular/compiler-cli": "^17.0.0",
      "@types/jasmine": "~5.1.0",
      "jasmine-core": "~5.1.0",
      "karma": "~6.4.0",
      "karma-chrome-launcher": "~3.2.0",
      "karma-coverage": "~2.2.0",
      "karma-jasmine": "~5.1.0",
      "karma-jasmine-html-reporter": "~2.1.0",
      "typescript": "~5.2.2"
    }
  }, null, 2);
};

// Función para generar el template HTML basado en los elementos del canvas
const generateAppTemplate = (canvasData: any) => {
  let template = '<div class="canvas-container">\n';
  
  // Ordenar las capas según el orden en layerIds
  canvasData.layerIds.forEach((layerId: string) => {
    const layer = canvasData.layers[layerId];
    
    if (layer) {
      switch (layer.type) {
        case LayerType.Rectangle:
          template += `  <div class="rectangle" 
              id="rect-${layerId}" 
              [style.left.px]="${layer.x}" 
              [style.top.px]="${layer.y}"
              [style.width.px]="${layer.width}"
              [style.height.px]="${layer.height}"
              [style.background-color]="'rgba(${layer.fill?.r || 255}, ${layer.fill?.g || 255}, ${layer.fill?.b || 255}, ${(layer.opacity || 100)/100})'"
              [style.border]="'1px solid rgba(${layer.stroke?.r || 0}, ${layer.stroke?.g || 0}, ${layer.stroke?.b || 0}, ${(layer.opacity || 100)/100})'">
            </div>\n`;
          break;
        case LayerType.Ellipse:
          template += `  <div class="ellipse" 
              id="ellipse-${layerId}" 
              [style.left.px]="${layer.x}" 
              [style.top.px]="${layer.y}"
              [style.width.px]="${layer.width}"
              [style.height.px]="${layer.height}"
              [style.background-color]="'rgba(${layer.fill?.r || 255}, ${layer.fill?.g || 255}, ${layer.fill?.b || 255}, ${(layer.opacity || 100)/100})'"
              [style.border]="'1px solid rgba(${layer.stroke?.r || 0}, ${layer.stroke?.g || 0}, ${layer.stroke?.b || 0}, ${(layer.opacity || 100)/100})'">
            </div>\n`;
          break;
        case LayerType.Text:
          template += `  <div class="text" 
              id="text-${layerId}" 
              [style.left.px]="${layer.x}" 
              [style.top.px]="${layer.y}"
              [style.font-size.px]="${layer.fontSize || 16}"
              [style.font-family]="'${layer.fontFamily || 'Arial'}'"
              [style.font-weight]="'${layer.fontWeight || 'normal'}'"
              [style.color]="'rgba(${layer.fill?.r || 0}, ${layer.fill?.g || 0}, ${layer.fill?.b || 0}, ${(layer.opacity || 100)/100})'">
              ${layer.text || ""}
            </div>\n`;
          break;
      }
    }
  });
  
  template += '</div>\n';
  return template;
};

// Función para generar estilos CSS basados en el canvas
const generateAppStyles = (canvasData: any) => {
  return `
.canvas-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  overflow: hidden;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
}

.rectangle {
  position: absolute;
  box-sizing: border-box;
  transform-origin: center;
}

.ellipse {
  position: absolute;
  border-radius: 50%;
  box-sizing: border-box;
  transform-origin: center;
}

.text {
  position: absolute;
  white-space: pre-wrap;
  transform-origin: center;
}
`;
};

// Función para generar estilos globales
const generateGlobalStyles = (canvasData: any) => {
  return `/* You can add global styles to this file, and also import other style files */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
  background-color: #ffffff;
}

app-root {
  display: block;
  width: 100%;
  height: 100%;
}
`;
};

// Otras funciones auxiliares para generar archivos del proyecto Angular
const generateAngularJson = (projectName: string) => {
  // Configuración básica de Angular
  return JSON.stringify({
    "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
    "version": 1,
    "newProjectRoot": "projects",
    "projects": {
      [projectName.toLowerCase().replace(/\s+/g, '-')]: {
        "projectType": "application",
        "schematics": {
          "@schematics/angular:component": {
            "style": "scss"
          }
        },
        "root": "",
        "sourceRoot": "src",
        "prefix": "app",
        "architect": {
          "build": {
            "builder": "@angular-devkit/build-angular:browser",
            "options": {
              "outputPath": "dist",
              "index": "src/index.html",
              "main": "src/main.ts",
              "polyfills": ["zone.js"],
              "tsConfig": "tsconfig.json",
              "assets": ["src/favicon.ico", "src/assets"],
              "styles": ["src/styles.scss"],
              "scripts": []
            }
          },
          "serve": {
            "builder": "@angular-devkit/build-angular:dev-server",
            "options": {
              "buildTarget": `${projectName.toLowerCase().replace(/\s+/g, '-')}:build`
            }
          }
        }
      }
    }
  }, null, 2);
};

const generateTsConfig = () => {
  return JSON.stringify({
    "compileOnSave": false,
    "compilerOptions": {
      "baseUrl": "./",
      "outDir": "./dist/out-tsc",
      "forceConsistentCasingInFileNames": true,
      "strict": true,
      "noImplicitOverride": true,
      "noPropertyAccessFromIndexSignature": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      "sourceMap": true,
      "declaration": false,
      "downlevelIteration": true,
      "experimentalDecorators": true,
      "moduleResolution": "node",
      "importHelpers": true,
      "target": "ES2022",
      "module": "ES2022",
      "useDefineForClassFields": false,
      "lib": ["ES2022", "dom"]
    },
    "angularCompilerOptions": {
      "enableI18nLegacyMessageIdFormat": false,
      "strictInjectionParameters": true,
      "strictInputAccessModifiers": true,
      "strictTemplates": true
    }
  }, null, 2);
};

const generateAppModule = (canvasData: any) => {
  return `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
`;
};

const generateAppComponent = (canvasData: any) => {
  return `import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = '${canvasData.name || "Canvas Design"}';
  
  // Datos del diseño importados desde Figma Clone
  canvasData: any;
  
  // Factor de escala para ajustar el diseño a la pantalla
  scale: number = 1;
  
  ngOnInit() {
    // Inicializar los datos del canvas
    this.canvasData = ${JSON.stringify(canvasData, null, 2)};
  }
  
  ngAfterViewInit() {
    // Ajustar el diseño al tamaño de la pantalla después de que la vista se haya inicializado
    setTimeout(() => this.adjustDesignToScreen(), 100);
  }
  
  @HostListener('window:resize')
  onResize() {
    // Volver a ajustar cuando cambie el tamaño de la ventana
    this.adjustDesignToScreen();
  }
  
  adjustDesignToScreen() {
    // Encontrar las dimensiones máximas del diseño
    let maxX = 0;
    let maxY = 0;
    
    Object.values(this.canvasData.layers).forEach((layer: any) => {
      const rightEdge = layer.x + (layer.width || 0);
      const bottomEdge = layer.y + (layer.height || 0);
      
      if (rightEdge > maxX) maxX = rightEdge;
      if (bottomEdge > maxY) maxY = bottomEdge;
    });
    
    // Calcular el factor de escala para ajustar a la pantalla
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Dejar un margen del 2%
    const margin = 0.02;
    const scaleX = (windowWidth * (1 - margin * 2)) / maxX;
    const scaleY = (windowHeight * (1 - margin * 2)) / maxY;
    
    // Usar el factor más pequeño para asegurar que todo el diseño sea visible
    this.scale = Math.min(scaleX, scaleY);
    
    // Aplicar la escala a todos los elementos
    const container = document.querySelector('.canvas-container') as HTMLElement;
    if (container) {
      container.style.transform = \`scale(\${this.scale})\`;
      container.style.transformOrigin = 'center';
      container.style.width = \`\${maxX}px\`;
      container.style.height = \`\${maxY}px\`;
    }
  }
}
`;
};

const generateIndexHtml = (projectName: string) => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${projectName}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
`;
};

const generateMainTs = () => {
  return `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
`;
};

const generateEnvironment = () => {
  return `export const environment = {
  production: false
};
`;
};

const generateEnvironmentProd = () => {
  return `export const environment = {
  production: true
};
`;
};

const generateReadme = (projectName: string) => {
  return `# ${projectName} - Angular Project

Este proyecto Angular fue generado automáticamente a partir de un diseño creado en Figma Clone.

## Instrucciones de instalación

1. Descomprime el archivo ZIP
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta \`npm install\` para instalar las dependencias
4. Ejecuta \`ng serve\` para iniciar el servidor de desarrollo
5. Navega a \`http://localhost:4200/\` para ver la aplicación

## Estructura del proyecto

- \`src/app/app.component.html\`: Contiene la estructura HTML generada a partir del diseño
- \`src/app/app.component.scss\`: Contiene los estilos CSS generados
- \`src/app/app.component.ts\`: Contiene la lógica del componente principal

## Personalización

Puedes modificar cualquier archivo para adaptar el diseño a tus necesidades.
`;
};
