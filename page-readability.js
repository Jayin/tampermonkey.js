// ==UserScript==
// @name         阅读模式
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  使用 Readability 提取内容，点击按钮展示全屏阅读模式
// @author       Jayin
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tencent.com
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_addElement
// ==/UserScript==

(function() {
    'use strict';

    // 使用 GM_addStyle 动态注入 CSS
    GM_addStyle(`
        .reading-container {
          padding: 4% 10% !important;
        }
        .reading-container p {
          text-align: left;
        }
        .reading-container p img {
          display: block;
          margin: 0 auto;
        }
    `);

    // 引入 Readability.js
    GM_addElement('script', {
        src: 'https://unpkg.com/@mozilla/readability@0.6.0/Readability.js',
        type: 'text/javascript'
    });

    // 创建一个按钮
    let button = document.createElement("button");
    // 按钮文字
    button.textContent = "阅读模式";
    // 固定在屏幕右下角
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    // 蓝色背景
    button.style.backgroundColor = "#007bff";
    // 白色文字
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    // 确保按钮在顶部
    button.style.zIndex = "9999";

    // 按钮点击事件，切换到阅读模式
    button.addEventListener("click", function() {
        // 使用 Readability 提取页面内容
        var documentClone = document.cloneNode(true);
        let reader = new Readability(documentClone, {
            keepClasses: false,
        });
        let article = reader.parse();
        console.log(article);
        console.log(article.content);
        // 判断是否能提取
        if (!article.content){
            console.log('Readability: 无法提取内容')
            return
        }
        // 清洗内容
        // 清理 HTML 标签属性
        function removeAttributesFromHtml(html) {
            let tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;

            function removeAttributes(node) {
                if (node.nodeType === 1) { // 仅处理元素节点
                    let allowedAttributes = {
                        'img': ['src', 'alt'],
                        'a': ['href'],
                        'video': ['src', 'controls'],
                        'audio': ['src', 'controls']
                    };

                    let tagName = node.tagName.toLowerCase();
                    let keepAttrs = allowedAttributes[tagName] || [];

                    // 遍历属性，移除不在允许列表中的属性
                    for (let i = node.attributes.length - 1; i >= 0; i--) {
                        let attrName = node.attributes[i].name;
                        if (!keepAttrs.includes(attrName)) {
                            node.removeAttribute(attrName);
                        }
                    }
                }

                // 递归处理子节点
                for (let i = 0; i < node.childNodes.length; i++) {
                    removeAttributes(node.childNodes[i]);
                }
            }

            removeAttributes(tempDiv);
            return tempDiv.innerHTML;
        }
        article.content = removeAttributesFromHtml(article.content)
        // 清理标签
        article.content = article.content.replaceAll('<span>', '')
        article.content = article.content.replaceAll('</span>', '')
        article.content = article.content.replaceAll('<div>', '')
        article.content = article.content.replaceAll('</div>', '')
        console.log(article.content)
        console.log(article.content.length)


        // 创建阅读模式的显示页面
        let readingMode = document.createElement("div");
        readingMode.style.position = "fixed";
        readingMode.style.top = "0";
        readingMode.style.left = "0";
        readingMode.style.right = "0";
        readingMode.style.bottom = "0";
        readingMode.style.backgroundColor = "white";
        readingMode.style.color = "black";
        readingMode.style.padding = "20px";
        readingMode.style.overflowY = "scroll";
        readingMode.style.zIndex = "10000";
        readingMode.style.fontFamily = "Arial, sans-serif";
        readingMode.style.fontSize = "16px";
        readingMode.style.lineHeight = "1.6";
        readingMode.style.boxSizing = "border-box";
        // 为 readingMode 添加首行缩进
        // 缩进两个字符宽度
        readingMode.style.textIndent = "2em";
        // 为 readingMode 元素添加类名 reading-container
        readingMode.classList.add("reading-container");

        // 添加标题
        let title = document.createElement("h1");
        title.textContent = article.title;
        title.style.textAlign = "center";
        title.style.marginBottom = "20px";
        readingMode.appendChild(title);

        // 添加正文内容
        let content = document.createElement("div");
        content.innerHTML = article.content;
        readingMode.appendChild(content);

        // 添加关闭按钮
        let closeButton = document.createElement("button");
        closeButton.textContent = "关闭";
        closeButton.style.position = "absolute";
        closeButton.style.top = "20px";
        closeButton.style.right = "20px";
        closeButton.style.padding = "10px 20px";
        // 红色背景
        closeButton.style.backgroundColor = "#ff4d4d";
        // 白色文字
        closeButton.style.color = "white";
        closeButton.style.border = "none";
        closeButton.style.borderRadius = "5px";
        closeButton.style.cursor = "pointer";
        closeButton.addEventListener("click", function() {
            document.body.removeChild(readingMode);
        });
        readingMode.appendChild(closeButton);

        // 将阅读模式内容添加到页面
        document.body.appendChild(readingMode);

        // 移除原始页面中的按钮
        button.style.display = "none";
    });

    // 添加按钮到页面
    document.body.appendChild(button);
})();
