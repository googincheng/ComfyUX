import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class Carousel {
    /**
     * Initializes the carousel with a container and an array of image sources.
     * @param {HTMLElement | null} container - The DOM element to use as the carousel container. If null, a new container will be created.
     * @param {string[]} images - An array of image source URLs.
     */
    constructor(container, images) {
        if(container)
            {
                this.container = container;
            }
        else
            {
                this.container = document.createElement("div");
                this.container.className = 'carousel-container';
            }
        this.images = images;
        this.thumbnails = [];
        this.currentIndex = 0;
        this.element;
        
        this.init();
    }

    init() {

        // 创建主图片容器
        this.mainContainer = document.createElement('div');
        this.mainContainer.className = 'carousel-main';
        this.mainImage = document.createElement('img');
        this.mainContainer.appendChild(this.mainImage);

        // 创建缩略图容器
        this.thumbnailContainer = document.createElement('div');
        this.thumbnailContainer.className = 'carousel-thumbnails';

        // 创建模态框
        this.modal = document.createElement('div');
        this.modal.className = 'carousel-modal';
        this.modalImage = document.createElement('img');
        this.modal.appendChild(this.modalImage);

        this.container.appendChild(this.mainContainer);
        this.container.appendChild(this.thumbnailContainer);
        document.body.appendChild(this.modal);

        this.addThumbnail(this.images);


        this.mainImage.addEventListener('click', () => this.showModal());
        this.modal.addEventListener('click', () => this.hideModal());

        // 支持触摸板及鼠标滚轮横向滚动
        this.thumbnailContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.thumbnailContainer.scrollLeft += e.deltaX;
            this.thumbnailContainer.scrollLeft += e.deltaY;
        });
        
        this.element = this.container;
    }


    addThumbnail(imageSrcArray) {
        imageSrcArray.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.className = 'carousel-thumbnail';

            const thumbnailsIndex = this.thumbnails.length;
            thumbnail.addEventListener('click', () => this.showImage(thumbnailsIndex));
            // this.thumbnailContainer.appendChild(thumbnail);
            // this.thumbnails.push(thumbnail);
            // this.images.push(image);
            this.thumbnailContainer.insertBefore(thumbnail, this.thumbnailContainer.firstChild); // Insert at the beginning
            this.thumbnails.unshift(thumbnail); // Add to the beginning of the thumbnails array
            // this.images.unshift(image); // Add to the beginning of the images array
            
            this.thumbnails.forEach((thumb, idx) => {
                thumb.removeEventListener('click', thumb.clickEvent);
                thumb.clickEvent = () => this.showImage(idx);
                thumb.addEventListener('click', thumb.clickEvent);
            });
        });

        this.showImage(0);
    }
    

    showImage(index) {
        this.currentIndex = index;
        this.mainImage.style.opacity = 0;

        this.thumbnails.forEach((thumbnail, idx) => {
            if (idx === index) {
                thumbnail.classList.add('selected');
            } else {
                thumbnail.classList.remove('selected');
            }
        });

        setTimeout(() => {
            this.mainImage.src = this.thumbnails[index].src;
            this.mainImage.style.opacity = 1;
        }, 100); // 动画时间应与CSS过渡时间匹配
    }

    showModal() {
        this.modalImage.src = this.thumbnails[this.currentIndex].src;
        this.modal.classList.add('show');
    }

    hideModal() {
        this.modal.classList.remove('show');
    }
}
