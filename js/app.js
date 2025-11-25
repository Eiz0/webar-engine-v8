import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

// Переменные для управления
let rotationSpeed = 0.005; // Нормальная скорость
let currentSpeedMode = 1; // 0 - медленно, 1 - нормально, 2 - быстро

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
            if (xhr.lengthComputable && xhr.total > 0) {
                const percent = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
                statusText.textContent = `Загрузка модели: ${percent}%`;
            } else {
                statusText.textContent = `Загрузка модели...`;
            }
        },
        function(error) {
            console.error('Ошибка загрузки модели:', error);
            statusText.textContent = 'Ошибка загрузки модели';
        }
    );
    
    // Запускаем AR
    await mindarThree.start();
    // Показываем панель управления
    document.getElementById('controls').style.display = 'flex';
    statusText.textContent = 'AR активен! Наведите камеру на маркер';
    
    // Переменная для модели (чтобы было доступно в анимации)
    let engineModel = null;

    // Анимация
    renderer.setAnimationLoop(() => {
        if (engineModel) {
            engineModel.rotation.y += rotationSpeed;
        }
        renderer.render(scene, camera);
    });
}

// Показываем кнопку запуска
statusText.textContent = 'Готово к запуску AR';
startButton.style.display = 'block';
startButton.onclick = startAR;

// Обработчики кнопок
document.getElementById('speedBtn').addEventListener('click', () => {
    currentSpeedMode = (currentSpeedMode + 1) % 3;
    const speeds = [0.002, 0.005, 0.01];
    const labels = ['Медленная', 'Нормальная', 'Быстрая'];
    rotationSpeed = speeds[currentSpeedMode];
    document.getElementById('speedBtn').textContent = `⚡ Скорость: ${labels[currentSpeedMode]}`;
});

document.getElementById('infoBtn').addEventListener('click', () => {
    document.getElementById('infoPanel').style.display = 'block';
    document.getElementById('partsPanel').style.display = 'none';
});

document.getElementById('partsBtn').addEventListener('click', () => {
    document.getElementById('partsPanel').style.display = 'block';
    document.getElementById('infoPanel').style.display = 'none';
});

document.getElementById('closeInfo').addEventListener('click', () => {
    document.getElementById('infoPanel').style.display = 'none';
});

document.getElementById('closeParts').addEventListener('click', () => {
    document.getElementById('partsPanel').style.display = 'none';
});