// Edugates-ClipSAT Science Labs - Student & Classroom Mastery Tracker
// Persistent progress store with local storage, competency analytics, and STEM badges

export const ProgressStore = {
  getStats() {
    const raw = localStorage.getItem("clipsat_mastery_stats");
    if (!raw) {
      return {
        modulesExplored: [],
        labsLaunched: [],
        quizzesTaken: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        recentScores: []
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        modulesExplored: [],
        labsLaunched: [],
        quizzesTaken: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        recentScores: []
      };
    }
  },

  saveStats(stats) {
    localStorage.setItem("clipsat_mastery_stats", JSON.stringify(stats));
  },

  recordModuleExplored(moduleCode) {
    const stats = this.getStats();
    if (!stats.modulesExplored.includes(moduleCode)) {
      stats.modulesExplored.push(moduleCode);
      this.saveStats(stats);
    }
  },

  recordLabLaunched(labId) {
    const stats = this.getStats();
    if (!stats.labsLaunched.includes(labId)) {
      stats.labsLaunched.push(labId);
      this.saveStats(stats);
    }
  },

  recordQuizResult(totalQuestions, correctCount) {
    const stats = this.getStats();
    stats.quizzesTaken++;
    stats.questionsAnswered += totalQuestions;
    stats.correctAnswers += correctCount;
    stats.recentScores.unshift({
      date: new Date().toLocaleDateString(),
      score: Math.round((correctCount / totalQuestions) * 100),
      total: totalQuestions,
      correct: correctCount
    });
    if (stats.recentScores.length > 10) stats.recentScores.pop();
    this.saveStats(stats);
  },

  resetAll() {
    localStorage.removeItem("clipsat_mastery_stats");
    localStorage.removeItem("clipsat_mastered_cards");
  }
};

export function openProgressModal() {
  let overlay = document.getElementById("progress-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "progress-modal-overlay";
    overlay.className = "modal-overlay";
    document.body.appendChild(overlay);
  }

  const stats = ProgressStore.getStats();
  const accuracy = stats.questionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) 
    : 0;

  const totalCurriculumModules = 74;
  const moduleProgress = Math.min(100, Math.round((stats.modulesExplored.length / totalCurriculumModules) * 100));
  const totalLabs = 9;
  const labProgress = Math.min(100, Math.round((stats.labsLaunched.length / totalLabs) * 100));

  // STEM Badges
  const badges = [
    {
      id: "b-first-step",
      name: "STEM Explorer",
      desc: "Explore your first curriculum module",
      unlocked: stats.modulesExplored.length >= 1,
      icon: "🚀"
    },
    {
      id: "b-lab-novice",
      name: "Lab Investigator",
      desc: "Conduct 3 different virtual lab experiments",
      unlocked: stats.labsLaunched.length >= 3,
      icon: "⚗️"
    },
    {
      id: "b-quiz-champ",
      name: "Assessment Prodigy",
      desc: "Complete at least 1 timed or practice assessment",
      unlocked: stats.quizzesTaken >= 1,
      icon: "🏆"
    },
    {
      id: "b-accuracy-star",
      name: "High-Caliber Scholar",
      desc: "Achieve 80%+ cumulative quiz accuracy",
      unlocked: stats.questionsAnswered >= 5 && accuracy >= 80,
      icon: "⭐"
    },
    {
      id: "b-lab-master",
      name: "Master of Simulation",
      desc: "Launch all 9 interactive laboratory suites",
      unlocked: stats.labsLaunched.length >= 9,
      icon: "🌌"
    }
  ];

  overlay.innerHTML = `
    <div class="modal-content-shell" style="max-width: 820px;">
      <div class="modal-header">
        <div class="modal-header-titles">
          <div class="modal-category-badge" style="color: #f59e0b;">
            Learning Analytics & Competency Tracking
          </div>
          <div class="modal-title">Student STEM Mastery Dashboard</div>
        </div>
        <button class="modal-close-btn" id="btn-close-progress">✕</button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Metrics Banner -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px;">
          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; text-align: center;">
            <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #38bdf8;">
              ${stats.modulesExplored.length} / 74
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">
              Modules Explored (${moduleProgress}%)
            </div>
          </div>

          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; text-align: center;">
            <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #a855f7;">
              ${stats.labsLaunched.length} / 9
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">
              Virtual Labs Done (${labProgress}%)
            </div>
          </div>

          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; text-align: center;">
            <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #10b981;">
              ${stats.quizzesTaken}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">
              Assessments Done
            </div>
          </div>

          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; text-align: center;">
            <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #f59e0b;">
              ${accuracy}%
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">
              Quiz Accuracy Rate
            </div>
          </div>
        </div>

        <!-- Earned STEM Badges -->
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin-bottom: 12px; color: var(--text-main);">
            STEM Badges & Milestones
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            ${badges.map(b => `
              <div style="
                background: ${b.unlocked ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)'};
                border: 1px solid ${b.unlocked ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'};
                border-radius: var(--radius-md);
                padding: 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                opacity: ${b.unlocked ? '1' : '0.6'};
              ">
                <div style="font-size: 1.8rem;">${b.icon}</div>
                <div>
                  <div style="font-weight: 700; color: ${b.unlocked ? '#10b981' : 'var(--text-muted)'}; font-size: 0.95rem;">
                    ${b.name}
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">
                    ${b.desc}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Recent Scores Table -->
        ${stats.recentScores.length > 0 ? `
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin-bottom: 12px; color: var(--text-main);">
              Recent Assessment Log
            </h3>
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead>
                  <tr style="background: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                    <th style="padding: 10px 14px;">Date</th>
                    <th style="padding: 10px 14px;">Score</th>
                    <th style="padding: 10px 14px;">Questions</th>
                    <th style="padding: 10px 14px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.recentScores.map(s => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 10px 14px;">${s.date}</td>
                      <td style="padding: 10px 14px; font-weight: 700; color: ${s.score >= 80 ? '#10b981' : s.score >= 60 ? '#f59e0b' : '#ef4444'};">
                        ${s.score}%
                      </td>
                      <td style="padding: 10px 14px;">${s.correct} / ${s.total}</td>
                      <td style="padding: 10px 14px;">
                        <span style="font-size: 0.8rem; padding: 2px 8px; border-radius: 4px; background: ${s.score >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${s.score >= 70 ? '#10b981' : '#ef4444'};">
                          ${s.score >= 70 ? 'Passed' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        ` : ""}

        <!-- Reset Button -->
        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
          <button class="btn btn-secondary" id="btn-reset-stats" style="font-size: 0.8rem; padding: 6px 14px; color: #ef4444; border-color: rgba(239,68,68,0.3);">
            Reset Progress Telemetry
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn-close-progress").addEventListener("click", () => {
    overlay.style.display = "none";
  });

  document.getElementById("btn-reset-stats").addEventListener("click", () => {
    if (confirm("Are you sure you want to reset your learning stats and mastered cards?")) {
      ProgressStore.resetAll();
      openProgressModal();
    }
  });

  overlay.style.display = "flex";
}
