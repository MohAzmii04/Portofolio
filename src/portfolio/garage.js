import { portfolioData } from '../data/portfolio.js';

export function setupPortfolioGarage() {
    const contentContainer = document.getElementById('portfolio-content');
    const navButtons = document.querySelectorAll('.portfolio-nav button');

    if (!contentContainer) return;

    function renderSection(sectionName) {
        // Update active class on nav buttons
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === sectionName);
        });

        let html = '';

        switch (sectionName) {
            case 'about':
                html = `
                    <div class="portfolio-card fade-in">
                        <div class="profile-header-badge">
                            <div class="avatar-glow">🏎️</div>
                            <div>
                                <h3 class="profile-name">${portfolioData.profile.name}</h3>
                                <p class="profile-role">${portfolioData.profile.role}</p>
                            </div>
                        </div>
                        <p class="profile-bio">${portfolioData.profile.bio}</p>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">University</span>
                                <span class="info-value">${portfolioData.profile.university}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Student ID</span>
                                <span class="info-value font-mono">${portfolioData.profile.studentId}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Status</span>
                                <span class="info-value status-badge">🟢 Ready to Build & Collaborate</span>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'skills':
                // Group skills by category
                const categories = {};
                portfolioData.skills.forEach(s => {
                    if (!categories[s.category]) categories[s.category] = [];
                    categories[s.category].push(s);
                });

                html = `
                    <div class="portfolio-card fade-in">
                        <h3 class="card-heading">Technical Arsenal & Skills</h3>
                        <p class="card-subheading">Core competencies spanning modern web engineering, 3D graphics, and system architecture.</p>
                        
                        <div class="skills-categories-grid">
                            ${Object.entries(categories).map(([catName, skills]) => `
                                <div class="skill-category-block">
                                    <h4 class="category-title">${catName}</h4>
                                    <div class="skills-chips">
                                        ${skills.map(skill => `
                                            <div class="skill-chip">
                                                <span class="skill-name">${skill.name}</span>
                                                <span class="skill-level-tag">${skill.level}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                break;

            case 'projects':
                html = `
                    <div class="portfolio-card fade-in">
                        <h3 class="card-heading">Featured Engineering Projects</h3>
                        <p class="card-subheading">Selected highlights in fullstack web systems, computer vision, and real-time computing.</p>
                        
                        <div class="projects-list">
                            ${portfolioData.projects.map((proj, idx) => `
                                <div class="project-entry">
                                    <div class="project-top">
                                        <span class="project-index">0${idx + 1}</span>
                                        <h4 class="project-title">${proj.title}</h4>
                                    </div>
                                    <p class="project-desc">${proj.description}</p>
                                    <div class="tech-stack-row">
                                        ${proj.technologies.map(tech => `
                                            <span class="tech-pill">${tech}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                break;

            case 'contact':
                html = `
                    <div class="portfolio-card fade-in">
                        <h3 class="card-heading">Let's Connect & Collaborate</h3>
                        <p class="card-subheading">Available for freelance development, full-time opportunities, and high-impact technology projects.</p>
                        
                        <div class="contact-methods">
                            <a href="mailto:${portfolioData.profile.email}" class="contact-card">
                                <span class="contact-icon">✉️</span>
                                <div>
                                    <span class="contact-label">Email Me</span>
                                    <span class="contact-value">${portfolioData.profile.email}</span>
                                </div>
                            </a>

                            <a href="${portfolioData.profile.github}" target="_blank" rel="noopener noreferrer" class="contact-card">
                                <span class="contact-icon">🐙</span>
                                <div>
                                    <span class="contact-label">GitHub</span>
                                    <span class="contact-value">${portfolioData.profile.github.replace('https://', '')}</span>
                                </div>
                            </a>

                            <a href="${portfolioData.profile.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-card">
                                <span class="contact-icon">💼</span>
                                <div>
                                    <span class="contact-label">LinkedIn</span>
                                    <span class="contact-value">Connect on LinkedIn</span>
                                </div>
                            </a>
                        </div>
                    </div>
                `;
                break;

            default:
                html = `<p>Select a category above.</p>`;
        }

        contentContainer.innerHTML = html;
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            renderSection(target);
        });
    });

    // Default to About tab
    renderSection('about');
}