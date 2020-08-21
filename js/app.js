// making sure that the script will work wherever the script is included 
document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    // variable to hold the sections elements
    let sections;
    // variable for the scroll up button
    let scrollUp = document.querySelector('#su-btn');
    // variable for the ul of the nav
    let navList = document.querySelector('#navbar__list');
    // variable to hold the y pos of the sections in the page
    let sectionsPos = [];
    // variable to hold the nav li elements
    let navItems = [];
    // variable to hold the last active element "last element in the viewport"
    let lastActive = null;
    // flags to indicate when scrolling and changing the dom
    // flag to differ when the user is scrolling or when the program is scrolling
    let activeScroll = true;
    // flag to differ when the user of api is changing the dom or the program is doing
    let activeChange = true;


    // helper functions
    // function to move the indication bar and active class from the navitem and section
    function triggerActive(element) {
        // if this is the first time
        if (lastActive) {
            // get the id from the dataset of the nav item to deactivate the classes
            let lastSection = document.querySelector(`#${lastActive.dataset.section}`);
            // remove the active classes from the nav item and the corresponding section 
            lastActive.classList.remove('active');
            lastSection && lastSection.classList.remove('your-active-class');
        }
        // update the lastactive variable with current showen section
        lastActive = element;
        let currentSection = document.querySelector(`#${element.dataset.section}`);
        // add the active classes to the current sections
        element.classList.add('active');
        currentSection && currentSection.classList.add('your-active-class');
    }

    // function to calculate the distane between to numbers
    function dist(x, y) { return Math.abs(x - y); }

    // function to get the nearset position of the value in the array using BS O(log(n))
    function getPos(value, arr) {
        // define the left and right positions to search between
        let l = 0,
            r = arr.length - 1,
            m = 0;
        // performing the binary search get all possible answers (l,r,m)
        while (l <= r) {
            m = l + r >> 1;
            if (arr[m] == value) break;
            else if (arr[m] > value) r = m - 1;
            else l = m + 1;
        }
        // this for making sure that all (l,m,r) is a valued positions in the array 
        l = Math.min(4, l);
        r = Math.max(0, r);
        // updating m with the positions of the nearset point to to the value 
        m = dist(arr[m], value) < dist(arr[l], value) ? (dist(arr[m], value) < dist(arr[r], value) ? m : r) :
            (dist(arr[l], value) < dist(arr[r], value) ? l : r);
        return m;
    }

    // function to build the nav and update the navList
    function buildNav() {
        // creating the DOM fragment to hold the list items
        let domFragment = new DocumentFragment();
        // get the all sections from the dom
        sections = document.getElementsByTagName('section');
        // reset all the nav items and the corresponding positions of the sections
        navItems = [];
        sectionsPos = [];
        // reset the lastActive element to avoid possible errors when removing sections from the dom 
        lastActive = null;
        // looping over the sections and get the nav item name from the dataset and section positions too
        for (let i = 0; i < sections.length; i++) {
            let e = sections[i];
            sectionsPos.push(e.offsetTop);
            const li = document.createElement('li');
            li.textContent = e.dataset['nav'];
            // save the id of the sections in the dataset of the list item
            li.dataset.section = e.id;
            domFragment.appendChild(li);
            navItems.push(li);
        }
        // hide the nav ul while updating the elment
        navList.style.display = 'none';
        // clear all the old elements
        navList.innerHTML = '';
        // append the new sections
        navList.appendChild(domFragment);
        // set the display again
        navList.style.display = 'block';
    }

    // function to rebuild the nav
    function rebuildNav() {
        // we deactivate the changes while updating the nav
        if (!activeChange) return;
        activeChange = false;
        // call build the nav and activate the flag again
        setTimeout(() => {
            buildNav();
            activeChange = true;
        }, 800);
    }


    // main functions call
    // build the nav
    buildNav();

    // adding the listensers to  make the dom dynamic
    // listen for the click on the one of the nav list items
    navList.addEventListener('click', e => {
        // if the target was not a li so don't make any changes
        if (e.target.nodeName != 'LI') return;
        // deactivate the scroll flag
        activeScroll = false;
        // than change the current viewed items and sections
        triggerActive(e.target);
        // get the corresponding section for the clicked  nav item
        const targetElement = document.querySelector(`#${e.target.dataset.section}`);
        // get the position of the section to scroll to
        const elementPos = targetElement.offsetTop;
        // scroll to the wanted position with smooth behavior
        scroll({
            top: elementPos,
            behavior: 'smooth'
        });
        // reactivate the scrolling flag after 1s
        setTimeout(() => {
            activeScroll = true;
        }, 1000);
    }, false);

    // listen to the click on the scroll up button and scroll to the top of the page
    scrollUp.addEventListener('click', () => scroll({
        top: 0,
        behavior: 'smooth'
    }));

    // listen for the scrolling event to update and know the current viewed section
    document.addEventListener('scroll', () => {
        // hide the scroll up button when the page is already on the top
        if (window.pageYOffset == 0 && scrollUp.style.display != 'none') scrollUp.style.display = 'none';
        else if (scrollUp.style.display != 'block') scrollUp.style.display = 'flex';

        // if not the user who is scrolling then don't do any thing
        if (!activeScroll) return;
        // get the nearst section to the current page y position by BS 
        let pos = window.pageYOffset && getPos(window.pageYOffset, sectionsPos);
        // activate the current section and deactive the last one
        triggerActive(navItems[pos]);
    });

    // rebuild the nav when there is any changes insertion or deletion
    document.addEventListener('DOMNodeInserted', rebuildNav);
    document.addEventListener('DOMNodeRemoved', rebuildNav);

});