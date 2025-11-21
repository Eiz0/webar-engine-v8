import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

const container = document.getElementById('container');
const statusText = document.getElementById('status');
const startButton = document.getElementById('startButton');

// Функция запуска AR
async function startAR() {
    // Скрываем кнопку, показываем статус
    startButton.style.display = 'none';
    statusText.textContent = 'Загрузка AR...';
    
    // Инициализация Mind AR
    const mindarThree = new MindARThree({
        container: document.getElementById('ar-container'),
        imageTargetSrc: 'images/marker.mind'
    });
    
    const { renderer, scene, camera } = mindarThree;
    
    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Создаем якорь для модели
    const anchor = mindarThree.addAnchor(0);
    
    // Загружаем 3D модель
    const loader = new GLTFLoader();
    loader.load(
        'models/V8Engine.glb',
        function(gltf) {
            const model = gltf.scene;
            
            // Масштабируем и центрируем модель
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1 / maxDim;
            model.scale.multiplyScalar(scale);
            
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center.multiplyScalar(scale));
            
            // Добавляем модель к якорю
            anchor.group.add(model);
            engineModel = model; // Сохраняем ссылку на модель
            
            statusText.textContent = 'Наведите камеру на маркер';
            console.log('Модель загружена в AR');
        },
        function(xhr) {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
            statusText.textContent = `Загрузка модели: ${percent}%`;
        },
        function(error) {
            console.error('Ошибка загрузки модели:', error);
            statusText.textContent = 'Ошибка загрузки модели';
        }
    );
    
    // Запускаем AR
    await mindarThree.start();
    statusText.textContent = 'AR активен! Наведите камеру на маркер';
    
    // Переменная для модели (чтобы было доступно в анимации)
    let engineModel = null;

    // Анимация
    renderer.setAnimationLoop(() => {
        // Автовращение модели
        if (engineModel) {
            engineModel.rotation.y += 0.005; // Вращение по оси Y
        }
        renderer.render(scene, camera);
    });
}

// Показываем кнопку запуска
statusText.textContent = 'Готово к запуску AR';
startButton.style.display = 'block';
startButton.onclick = startAR;