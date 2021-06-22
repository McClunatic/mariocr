<template>
  <nav>
    <div class="navbar is-light" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" hef="#">
          Mari
          <img alt="MarioCR logo" src="../assets/mario-eye-transparent.png">
          CR
        </a>
        <a
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="app-navbar"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>
      <div id="app-navbar" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" href="#">Docs</a>
          <a class="navbar-item" href="#">Contact</a>
        </div>
      </div>
    </div>
  </nav>
</template>