import config from '../config';

export default function developerScale() {
    const aspectContainer = document.querySelector('.aspect-container');
    const appContent = document.querySelector('.app-content');

    function updateScale() {
        const containerWidth = aspectContainer.clientWidth;
        const containerHeight = aspectContainer.clientHeight;

        // Calculate scaling factor based on available width and height
        const scaleFactor = Math.min(containerWidth / 1920, containerHeight / 1080);

        // Apply scale transform to the app content
        appContent.style.transform = `scale(${scaleFactor})`;
    }

    if (config.useDeveloperScale) {
        aspectContainer.classList.add('dev');
        appContent.classList.add('dev');


        window.addEventListener('resize', updateScale);

        // Call updateScale on initial load
        updateScale();
    }

}
