// SEO utilities for Bookpango
class SEOManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setMetaTags();
        this.generateStructuredData();
    }
    
    setMetaTags() {
        // Set dynamic meta tags based on page
        const pageTitle = document.title;
        const metaDescription = document.querySelector('meta[name="description"]')?.content || 
                               'Bookpango - Global Book Reviews & Recommendations';
        
        // Set Open Graph tags
        this.setMetaTag('og:title', pageTitle);
        this.setMetaTag('og:description', metaDescription);
        this.setMetaTag('og:url', window.location.href);
        
        // Set Twitter Card tags
        this.setMetaTag('twitter:title', pageTitle);
        this.setMetaTag('twitter:description', metaDescription);
    }
    
    setMetaTag(property, content) {
        let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                     document.querySelector(`meta[name="${property}"]`);
        
        if (!metaTag) {
            metaTag = document.createElement('meta');
            if (property.startsWith('og:')) {
                metaTag.setAttribute('property', property);
            } else {
                metaTag.setAttribute('name', property);
            }
            document.head.appendChild(metaTag);
        }
        
        metaTag.setAttribute('content', content);
    }
    
    generateStructuredData() {
        // Generate JSON-LD structured data for the current page
        let structuredData = {};
        
        if (window.location.pathname === '/') {
            structuredData = this.generateWebsiteStructuredData();
        } else if (window.location.pathname.includes('/post.html')) {
            structuredData = this.generateArticleStructuredData();
        }
        
        if (Object.keys(structuredData).length > 0) {
            this.injectStructuredData(structuredData);
        }
    }
    
    generateWebsiteStructuredData() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Bookpango",
            "url": "https://www.bookpango.com",
            "description": "Global book reviews and recommendations",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.bookpango.com/search.html?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        };
    }
    
    generateArticleStructuredData() {
        // This would be populated with actual post data
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": document.title,
            "description": document.querySelector('meta[name="description"]')?.content || '',
            "author": {
                "@type": "Person",
                "name": "Bookpango Team"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Bookpango",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.bookpango.com/assets/images/logo.png"
                }
            },
            "datePublished": new Date().toISOString(),
            "dateModified": new Date().toISOString()
        };
    }
    
    injectStructuredData(data) {
        // Remove existing structured data
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            existingScript.remove();
        }
        
        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }
    
    updateMetaTagsForPost(postData) {
        if (!postData) return;
        
        // Update document title
        document.title = `${postData.title} | Bookpango`;
        
        // Update meta description
        this.setMetaTag('description', postData.excerpt || postData.metaDescription || '');
        
        // Update Open Graph tags
        this.setMetaTag('og:title', postData.title);
        this.setMetaTag('og:description', postData.excerpt || '');
        this.setMetaTag('og:image', postData.images?.cover || '');
        
        // Update Twitter Card tags
        this.setMetaTag('twitter:title', postData.title);
        this.setMetaTag('twitter:description', postData.excerpt || '');
        this.setMetaTag('twitter:image', postData.images?.cover || '');
    }
}

// Initialize SEO when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const seoManager = new SEOManager();
    window.seoManager = seoManager;
});
