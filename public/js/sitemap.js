// Sitemap generator for Bookpango
class SitemapGenerator {
    constructor() {
        this.baseUrl = 'https://www.bookpango.com';
    }
    
    async generateSitemap() {
        try {
            const posts = await dbManager.getPosts(1000);
            const categories = await dbManager.getCategories();
            
            const sitemap = this.createSitemapXML(posts, categories);
            return sitemap;
        } catch (error) {
            console.error('Error generating sitemap:', error);
            return this.createDefaultSitemap();
        }
    }
    
    createSitemapXML(posts, categories) {
        const today = new Date().toISOString().split('T')[0];
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
        
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/blog.html', priority: '0.9', changefreq: 'daily' },
            { url: '/categories.html', priority: '0.8', changefreq: 'weekly' },
            { url: '/about.html', priority: '0.7', changefreq: 'monthly' },
            { url: '/contact.html', priority: '0.7', changefreq: 'monthly' }
        ];
        
        staticPages.forEach(page => {
            xml += `
    <url>
        <loc>${this.baseUrl}${page.url}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
        });
        
        posts.forEach(post => {
            if (post.status === 'published') {
                xml += `
    <url>
        <loc>${this.baseUrl}/post.html?id=${post.id}</loc>
        <lastmod>${post.updatedAt ? post.updatedAt.toDate().toISOString().split('T')[0] : today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
            }
        });
        
        categories.forEach(category => {
            xml += `
    <url>
        <loc>${this.baseUrl}/categories.html?id=${category.id}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>`;
        });
        
        xml += '\n</urlset>';
        return xml;
    }
    
    createDefaultSitemap() {
        const today = new Date().toISOString().split('T')[0];
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://www.bookpango.com/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://www.bookpango.com/blog.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://www.bookpango.com/categories.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`;
    }
}

// Initialize sitemap generator
const sitemapGenerator = new SitemapGenerator();
window.sitemapGenerator = sitemapGenerator;
