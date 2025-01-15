'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// Blog post loading function
async function loadBlogPosts() {
  try {
    console.log('Attempting to load blog posts...');
    const response = await fetch('./blog/posts/index.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Loaded posts:', data);
    const posts = data.posts;
    
    const blogList = document.getElementById('blog-list');
    console.log('Blog list element:', blogList); // Debug log
    if (!blogList) {
      console.error('Blog list element not found!');
      return;
    }
    
    blogList.innerHTML = ''; // Clear existing posts
    console.log('Creating blog post elements...'); // Debug log
    
    for (const post of posts) {
      console.log('Creating post element for:', post.title); // Debug log
      const li = document.createElement('li');
      li.className = 'blog-post-item';
      
      li.innerHTML = `
        <article class="blog-post">
          <a href="#" class="blog-post-link" data-post-url="${post.url}">
            <header>
              <h3 class="h3 blog-item-title">${post.title}</h3>
              <div class="blog-meta">
                <p class="blog-category">${post.category}</p>
                <span class="dot"></span>
                <time datetime="${post.date}">${new Date(post.date).toLocaleDateString()}</time>
              </div>
            </header>
            
            ${post.image ? `
              <figure class="blog-banner-box">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
              </figure>
            ` : ''}
            
            <div class="blog-content">
              <p>${post.excerpt}</p>
              <span class="read-more">Read more →</span>
            </div>
          </a>
        </article>
      `;
      
      console.log('Appending post element to blog list'); // Debug log
      blogList.appendChild(li);
    }
    console.log('Finished loading blog posts'); // Debug log

    // Add click handlers for blog posts
    document.querySelectorAll('.blog-post-link').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const postUrl = link.dataset.postUrl;
          console.log('Loading post from:', postUrl);
          const postResponse = await fetch(postUrl);
          if (!postResponse.ok) {
            throw new Error(`HTTP error! status: ${postResponse.status}`);
          }
          const postContent = await postResponse.text();
          console.log('Post content loaded, parsing markdown...');
          const parsedContent = marked.parse(postContent);
          
          // Replace the blog list with the full post
          const blogSection = document.querySelector('.blog-posts');
          const originalContent = blogSection.innerHTML;
          
          // Add class for full post display
          blogSection.classList.add('showing-post');
          
          blogSection.innerHTML = `
            <div class="blog-post full-post">
              <button class="back-button">← Back to posts</button>
              <div class="blog-content">${parsedContent}</div>
            </div>
          `;

          // Add back button handler
          document.querySelector('.back-button').addEventListener('click', () => {
            blogSection.classList.remove('showing-post');
            blogSection.innerHTML = originalContent;
            loadBlogPosts(); // Reload the post list
          });
        } catch (error) {
          console.error('Error loading post content:', error);
          alert('Failed to load blog post. Please try again.');
        }
      });
    });
  } catch (error) {
    console.error('Error loading blog posts:', error);
  }
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const clickedPage = this.textContent.trim().toLowerCase();
    console.log('Clicked page:', clickedPage); // Debug log
    
    // Remove active class from all pages and links
    pages.forEach(page => {
      console.log('Checking page:', page.dataset.page, 'has active:', page.classList.contains('active')); // Debug log
      page.classList.remove("active");
      console.log('After remove, page:', page.dataset.page, 'has active:', page.classList.contains('active')); // Debug log
    });
    navigationLinks.forEach(link => link.classList.remove("active"));
    
    // Add active class to clicked page and link
    pages.forEach(page => {
      const pageName = page.dataset.page.toLowerCase();
      console.log('Checking page:', pageName, 'against clicked:', clickedPage); // Debug log
      if (pageName === clickedPage) {
        console.log('Adding active to:', pageName); // Debug log
        page.classList.add("active");
        console.log('After add, page has active:', page.classList.contains('active')); // Debug log
        this.classList.add("active");
        window.scrollTo(0, 0);
        
        // Load blog posts if we're switching to the blog page
        if (clickedPage === 'blog') {
          console.log('Loading blog posts for blog page'); // Debug log
          loadBlogPosts();
        }
      }
    });
  });
}

// Initial load if we're on the blog page or if blog is in URL hash
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1) || 'about'; // default to about if no hash
  const targetPage = hash.toLowerCase();
  console.log('Initial load page:', targetPage); // Debug log
  
  // Remove active class from all pages and links
  pages.forEach(page => page.classList.remove("active"));
  navigationLinks.forEach(link => link.classList.remove("active"));
  
  // Activate the target page and link
  pages.forEach(page => {
    const pageName = page.dataset.page.toLowerCase();
    if (pageName === targetPage) {
      console.log('Activating page:', pageName); // Debug log
      page.classList.add("active");
      // Find and activate corresponding nav link
      navigationLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase() === targetPage) {
          link.classList.add("active");
        }
      });
      
      // Load blog posts if we're on the blog page
      if (targetPage === 'blog') {
        loadBlogPosts();
      }
    }
  });
});