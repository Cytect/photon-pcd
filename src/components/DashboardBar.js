/* PHOTON — Dashboard Top Bar Component */
import { search } from '../icons/icons.js';

export function initDashboardBar(container) {
  container.innerHTML = `
    <div class="dashboard-bar-left">
      <img src="/logo.png" alt="Photon" class="dashboard-bar-logo" />
      <span class="dashboard-bar-title">Photon</span>
    </div>
    <div class="dashboard-bar-center">
      <div class="dashboard-search">
        ${search({ size: 14 })}
        <input type="text" placeholder="Search projects..." id="dashboard-search-input" />
      </div>
    </div>
    <div class="dashboard-bar-right"></div>
  `;
}
