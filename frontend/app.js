const API_URL = "http://127.0.0.1:8000";

// ==========================================
// DOM ELEMENTS
// ==========================================

const authSection = document.getElementById("auth-section");
const feedSection = document.getElementById("feed-section");
const profileSection = document.getElementById("profile-section");
const adminSection = document.getElementById("admin-section");

const loginForm = document.getElementById("login-form");
const createPostForm = document.getElementById("create-post-form");

const fileInput = document.getElementById("file-upload");
const fileNameDisplay = document.getElementById("file-name-display");

const logoutBtn = document.getElementById("logout-btn");
const navFeedBtn = document.getElementById("nav-feed-btn");
const navProfileBtn = document.getElementById("nav-profile-btn");
const navAdminBtn = document.getElementById("nav-admin-btn");
const themeBtn = document.getElementById("theme-toggle-btn");

const authToggleLink = document.getElementById("show-register");
const authTitle = document.querySelector("#auth-section h3");
const authBtn = document.getElementById("auth-submit-btn");

const loadPostsBtn = document.getElementById("load-posts-btn");
const loadMyPostsBtn = document.getElementById("load-my-posts-btn");

const postsContainer = document.getElementById("posts-container");
const myPostsContainer = document.getElementById("my-posts-container");

const errorText = document.getElementById("login-error");

// Profile elements
const editProfileModal = document.getElementById("edit-profile-modal");
const editProfileBtn = document.getElementById("edit-profile-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const editProfileForm = document.getElementById("edit-profile-form");

const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profileFirstName = document.getElementById("first-name");
const profileLastName = document.getElementById("last-name");
const profileAvatar = document.getElementById("profile-avatar");

const editEmail = document.getElementById("edit-email");
const editFirstName = document.getElementById("edit-first-name");
const editLastName = document.getElementById("edit-last-name");

const profileError = document.getElementById("profile-error");
const editProfileError = document.getElementById("edit-profile-error");
const saveProfileBtn = document.getElementById("save-profile-btn");

// Search and pagination
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const clearSearchBtn = document.getElementById("clear-search-btn");
const loadMoreBtn = document.getElementById("load-more-btn");
const noMorePostsText = document.getElementById("no-more-posts-text");

// Forgot password
const forgotPasswordLink = document.getElementById("forgot-password-link");
const fpModal = document.getElementById("forgot-password-modal");
const fpCloseBtn = document.getElementById("fp-close-btn");

const fpStep1 = document.getElementById("fp-step-1");
const fpStep2 = document.getElementById("fp-step-2");

const fpEmailInput = document.getElementById("fp-email");
const fpOtpInput = document.getElementById("fp-otp");
const fpNewPasswordInput = document.getElementById("fp-new-password");

const fpSendOtpBtn = document.getElementById("fp-send-otp-btn");
const fpResetBtn = document.getElementById("fp-reset-btn");
const fpMsg = document.getElementById("fp-msg");

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let isLoginMode = true;
let currentPage = 1;
let currentSearchQuery = "";
let currentResetToken = "";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getCurrentUser() {
    const userStr = localStorage.getItem("peerview_user");

    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        return null;
    }
}

function isUserAdmin(user) {
    if (!user) return false;
    return (
        user.role === "admin" ||
        user.is_staff === true ||
        user.is_superuser === true
    );
}

function updateAdminNavVisibility() {
    if (!navAdminBtn) return;
    const user = getCurrentUser();
    if (isUserAdmin(user)) {
        navAdminBtn.classList.remove("hidden");
    } else {
        navAdminBtn.classList.add("hidden");
    }
}

function getToken() {
    return localStorage.getItem("peerview_token");
}

function getAuthHeaders() {
    const token = getToken();
    return token ? { "Authorization": `Token ${token}` } : {};
}

async function getResponseData(response) {
    try {
        return await response.json();
    } catch (error) {
        return {};
    }
}

function extractList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && Array.isArray(data.posts)) return data.posts;
    if (data && Array.isArray(data.comments)) return data.comments;
    return [];
}

function showMessage(element, message, isError = true) {
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? "#dc2626" : "#16a34a";
    element.classList.remove("hidden");
}

function hideMessage(element) {
    if (element) {
        element.textContent = "";
        element.classList.add("hidden");
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    const token = getToken();

    if (token) {
        await fetchProfile(true);
        showFeed();
    } else {
        showAuth();
    }

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");

        if (themeBtn) {
            themeBtn.textContent = "☀️ Light Mode";
        }
    }
});

// ==========================================
// AUTHENTICATION
// ==========================================

if (authToggleLink) {
    authToggleLink.addEventListener("click", (e) => {
        e.preventDefault();

        isLoginMode = !isLoginMode;

        if (authTitle) {
            authTitle.textContent = isLoginMode
                ? "Welcome Back"
                : "Create Account";
        }

        if (authBtn) {
            authBtn.textContent = isLoginMode
                ? "Sign In"
                : "Register";
        }

        authToggleLink.textContent = isLoginMode
            ? "Sign Up"
            : "Back to Login";

        const emailGroup = document.getElementById("email-group");
        const emailInput = document.getElementById("email");

        if (isLoginMode) {
            emailGroup.classList.add("hidden");
            emailInput.removeAttribute("required");

            if (forgotPasswordLink) {
                forgotPasswordLink.classList.remove("hidden");
            }
        } else {
            emailGroup.classList.remove("hidden");
            emailInput.setAttribute("required", "true");

            if (forgotPasswordLink) {
                forgotPasswordLink.classList.add("hidden");
            }
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        hideMessage(errorText);

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const email = document.getElementById("email").value.trim();

        const endpoint = isLoginMode ? "/login/" : "/register/";

        const payload = isLoginMode
            ? { username, password }
            : { username, email, password };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await getResponseData(response);

            if (response.ok) {
                if (isLoginMode) {
                    if (!data.api_key) {
                        throw new Error("Authentication token was not returned.");
                    }

                    localStorage.setItem("peerview_token", data.api_key);

                    const isAdmin = Boolean(
                        data.role === "admin" ||
                        data.is_staff ||
                        data.is_superuser
                    );

                    localStorage.setItem(
                        "peerview_user",
                        JSON.stringify({
                            username: data.username || username,
                            email: data.email || "",
                            first_name: data.first_name || "",
                            last_name: data.last_name || "",
                            is_staff: Boolean(data.is_staff),
                            is_superuser: Boolean(data.is_superuser),
                            role: isAdmin ? "admin" : "user"
                        })
                    );

                    // Sync with /profile/ in case backend provides extra fields there
                    await fetchProfile(true);
                    showFeed();
                } else {
                    alert("Account created successfully! Please log in.");

                    isLoginMode = true;

                    if (authToggleLink) {
                        authToggleLink.click();
                    }

                    loginForm.reset();
                }
            } else {
                showMessage(
                    errorText,
                    data.error || data.message || "Authentication failed."
                );
            }
        } catch (error) {
            showMessage(
                errorText,
                error.message || "Server connection failed."
            );
        }
    });
}

// ==========================================
// FORGOT PASSWORD
// ==========================================

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();

        fpModal.classList.remove("hidden");

        fpStep1.classList.remove("hidden");
        fpStep2.classList.add("hidden");

        fpEmailInput.value = "";
        fpEmailInput.placeholder = "Your Username";

        fpOtpInput.classList.add("hidden");
        fpNewPasswordInput.value = "";

        fpMsg.textContent = "";
    });
}

if (fpCloseBtn) {
    fpCloseBtn.addEventListener("click", () => {
        fpModal.classList.add("hidden");
    });
}

if (fpSendOtpBtn) {
    fpSendOtpBtn.addEventListener("click", async () => {
        const username = fpEmailInput.value.trim();

        if (!username) {
            return alert("Please enter your username.");
        }

        fpSendOtpBtn.disabled = true;
        fpSendOtpBtn.textContent = "Sending...";

        try {
            const response = await fetch(`${API_URL}/forgot/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username })
            });

            const data = await getResponseData(response);

            if (response.ok) {
                currentResetToken = data.reset_token;

                fpMsg.style.color = "#16a34a";
                fpMsg.textContent = "User found! Proceed to reset password.";

                fpStep1.classList.add("hidden");
                fpStep2.classList.remove("hidden");
            } else {
                fpMsg.style.color = "#dc2626";
                fpMsg.textContent = data.error || data.message || "User not found.";
            }
        } catch (error) {
            fpMsg.style.color = "#dc2626";
            fpMsg.textContent = "Error connecting to server.";
        }

        fpSendOtpBtn.disabled = false;
        fpSendOtpBtn.textContent = "Next";
    });
}

if (fpResetBtn) {
    fpResetBtn.addEventListener("click", async () => {
        const new_password = fpNewPasswordInput.value;

        if (!new_password) {
            return alert("Please enter a new password.");
        }

        fpResetBtn.disabled = true;
        fpResetBtn.textContent = "Resetting...";

        try {
            const response = await fetch(`${API_URL}/new-password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reset_token: currentResetToken,
                    new_password
                })
            });

            const data = await getResponseData(response);

            if (response.ok) {
                alert("Password reset successful! You can now log in.");

                fpModal.classList.add("hidden");

                document.getElementById("username").value = fpEmailInput.value;
            } else {
                fpMsg.style.color = "#dc2626";
                fpMsg.textContent = data.error || data.message || "Reset failed.";
            }
        } catch (error) {
            fpMsg.style.color = "#dc2626";
            fpMsg.textContent = "Error connecting to server.";
        }

        fpResetBtn.disabled = false;
        fpResetBtn.textContent = "Confirm Password Reset";
    });
}

// ==========================================
// PROFILE PAGE
// ==========================================

function displayProfile(user) {
    if (!user) return;

    const username = user.username || "User";
    const email = user.email || "";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";

    if (profileUsername) {
        profileUsername.textContent = username;
    }

    if (profileEmail) {
        profileEmail.textContent = email || "Not provided";
    }

    if (profileFirstName) {
        profileFirstName.textContent = firstName || "Not provided";
    }

    if (profileLastName) {
        profileLastName.textContent = lastName || "Not provided";
    }

    if (profileAvatar) {
        profileAvatar.textContent = username.charAt(0).toUpperCase();
    }

    const oldUser = getCurrentUser() || {};
    const mergedUser = {
        ...oldUser,
        ...user
    };

    const isAdmin = isUserAdmin(mergedUser);
    mergedUser.role = isAdmin ? "admin" : "user";

    localStorage.setItem("peerview_user", JSON.stringify(mergedUser));
    updateAdminNavVisibility();
}

async function fetchProfile(silent = false) {
    const token = getToken();

    if (!token) {
        showAuth();
        return;
    }

    if (!silent) {
        hideMessage(profileError);
    }

    try {
        const response = await fetch(`${API_URL}/profile/`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "Unable to load profile information."
            );
        }

        const userData = data.user || data.data || data;
        displayProfile(userData);
    } catch (error) {
        const cachedUser = getCurrentUser();

        if (cachedUser) {
            displayProfile(cachedUser);
        }

        if (!silent) {
            showMessage(
                profileError,
                error.message || "Failed to load profile."
            );
        }

        console.error("Profile loading error:", error);
    }
}

// ==========================================
// OPEN & CLOSE EDIT PROFILE MODAL
// ==========================================

if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
        const user = getCurrentUser() || {};

        hideMessage(editProfileError);

        editEmail.value = user.email || "";
        editFirstName.value = user.first_name || "";
        editLastName.value = user.last_name || "";

        editProfileModal.classList.remove("hidden");
        editProfileModal.style.display = "flex";
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        editProfileModal.classList.add("hidden");
        editProfileModal.style.display = "";
        hideMessage(editProfileError);
    });
}

// ==========================================
// UPDATE PROFILE
// ==========================================

if (editProfileForm) {
    editProfileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        hideMessage(editProfileError);

        const email = editEmail.value.trim();
        const first_name = editFirstName.value.trim();
        const last_name = editLastName.value.trim();

        if (!email) {
            showMessage(editProfileError, "Email address is required.");
            return;
        }

        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = "Saving...";

        try {
            const response = await fetch(`${API_URL}/update-profile/`, {
                method: "PUT",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    first_name,
                    last_name
                })
            });

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Failed to update profile."
                );
            }

            const oldUser = getCurrentUser() || {};

            const updatedUser = {
                ...oldUser,
                ...(data.user || data.data || {}),
                email,
                first_name,
                last_name
            };

            displayProfile(updatedUser);

            editProfileModal.classList.add("hidden");
            editProfileModal.style.display = "";

            alert("Profile updated successfully!");
        } catch (error) {
            showMessage(
                editProfileError,
                error.message || "Failed to update profile."
            );
            console.error("Profile update error:", error);
        } finally {
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = "Save Changes";
        }
    });
}

// ==========================================
// POST CREATION
// ==========================================

if (createPostForm) {
    createPostForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const contentBox = document.getElementById("new-post-content");

        const formData = new FormData();
        formData.append("content", contentBox.value);

        if (fileInput && fileInput.files[0]) {
            formData.append("file", fileInput.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/posts/`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData
            });

            if (response.ok) {
                contentBox.value = "";

                if (fileInput) {
                    fileInput.value = "";
                }

                if (fileNameDisplay) {
                    fileNameDisplay.textContent = "";
                }

                if (searchInput) {
                    searchInput.value = "";
                }

                if (loadPostsBtn) {
                    loadPostsBtn.click();
                }
            } else {
                const data = await getResponseData(response);
                alert(`Error: ${data.message || data.error || "Failed to post"}`);
            }
        } catch (error) {
            alert("Post failed. Make sure the server is running.");
        }
    });
}

if (fileInput) {
    fileInput.addEventListener("change", () => {
        if (fileNameDisplay) {
            fileNameDisplay.textContent = fileInput.files[0]
                ? fileInput.files[0].name
                : "";
        }
    });
}

// ==========================================
// POST RENDERING
// ==========================================

function createPostHTML(post) {
    let mediaHtml = "";
    const fileUrl = post.file_path || post.file || "";

    if (fileUrl) {
        const fullUrl = fileUrl.startsWith("http")
            ? fileUrl
            : `${API_URL}${fileUrl}`;

        if (/\.(jpg|jpeg|png|gif)$/i.test(fileUrl)) {
            mediaHtml = `
                <img src="${fullUrl}"
                     alt="Post attachment"
                     style="width:100%;border-radius:8px;
                            margin:10px 0;border:1px solid var(--border);">
            `;
        } else if (fileUrl.toLowerCase().endsWith(".pdf")) {
            mediaHtml = `
                <div style="background:var(--bg-color);padding:15px;
                            border-radius:8px;margin:10px 0;
                            border:1px solid var(--border);">
                    <span style="font-size:1.5rem;">📄</span>
                    <p style="font-weight:600;">Document Attached</p>
                    <a href="${fullUrl}" target="_blank"
                       rel="noopener noreferrer"
                       style="color:var(--primary);">
                        View PDF
                    </a>
                </div>
            `;
        }
    }

    const currentUpvotes = post.upvotes ?? 0;
    const currentDownvotes = post.downvotes ?? 0;

    const currentUser = getCurrentUser();
    let deleteBtnHtml = "";

    if (
        currentUser &&
        (
            isUserAdmin(currentUser) ||
            currentUser.username === post.author_id ||
            currentUser.username === post.author ||
            currentUser.username === post.username
        )
    ) {
        deleteBtnHtml = `
            <button onclick="window.deletePost(${post.id})"
                    class="secondary-btn"
                    style="color:red;border-color:red;">
                Delete
            </button>
        `;
    }

    return `
        <div class="post-content">${post.content || ""}</div>

        ${mediaHtml}

        <div class="post-meta"
             style="display:flex;justify-content:space-between;
                    border-top:1px solid var(--border);
                    padding-top:10px;margin-top:10px;">
            <span style="font-size:0.85rem;color:var(--text-muted);">
                Post ID: ${post.id}
            </span>
            ${deleteBtnHtml}
        </div>

        <div style="margin-top:15px;display:flex;align-items:center;gap:20px;">
            <div style="display:flex;align-items:center;gap:8px;">
                <button onclick="window.castVote(${post.id},1)"
                        class="secondary-btn">
                    👍
                </button>
                <span style="font-weight:bold;color:#16a34a;">
                    ${currentUpvotes}
                </span>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
                <button onclick="window.castVote(${post.id},-1)"
                        class="secondary-btn">
                    👎
                </button>
                <span style="font-weight:bold;color:#dc2626;">
                    ${currentDownvotes}
                </span>
            </div>
        </div>

        <div id="comments-container-${post.id}" style="margin-top:10px;">
            <button onclick="window.loadComments(${post.id})"
                    class="secondary-btn w-100">
                View Reviews
            </button>
        </div>

        <div style="display:flex;gap:5px;margin-top:5px;">
            <input type="text"
                   id="comment-input-${post.id}"
                   placeholder="Review..."
                   style="flex:1;padding:8px;">
            <button onclick="window.postComment(${post.id})"
                    class="primary-btn">
                Send
            </button>
        </div>
    `;
}

// ==========================================
// FEED LOADING AND PAGINATION
// ==========================================

async function fetchAndRenderFeed(searchQuery = "", page = 1) {
    try {
        let url = `${API_URL}/posts/?page=${page}`;

        if (searchQuery) {
            url += `&q=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url, {
            headers: getAuthHeaders()
        });

        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error(data.message || data.error || "Failed to load posts.");
        }

        const posts = extractList(data);

        if (page === 1) {
            postsContainer.innerHTML = "";
            currentPage = 1;
            currentSearchQuery = searchQuery;

            if (noMorePostsText) {
                noMorePostsText.classList.add("hidden");
            }
        }

        if (posts.length === 0 && page === 1) {
            postsContainer.innerHTML = `
                <p style="padding:1rem;color:var(--text-muted);">
                    No posts found.
                </p>
            `;

            loadMoreBtn.classList.add("hidden");
            return;
        }

        posts.forEach(post => {
            const el = document.createElement("div");
            el.className = "post-card";
            el.innerHTML = createPostHTML(post);
            postsContainer.appendChild(el);
        });

        if (posts.length < 5) {
            loadMoreBtn.classList.add("hidden");

            if (noMorePostsText) {
                noMorePostsText.classList.remove("hidden");
            }
        } else {
            loadMoreBtn.classList.remove("hidden");

            if (noMorePostsText) {
                noMorePostsText.classList.add("hidden");
            }
        }
    } catch (error) {
        console.error("Feed load error:", error);
        if (page === 1 && postsContainer) {
            postsContainer.innerHTML = `
                <p style="padding:1rem;color:#dc2626;">
                    Could not load posts from ${API_URL}/posts/ (${error.message}).
                </p>
            `;
        }
    }
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
        currentPage++;
        fetchAndRenderFeed(currentSearchQuery, currentPage);
    });
}

if (loadPostsBtn) {
    loadPostsBtn.addEventListener("click", () => {
        fetchAndRenderFeed(
            searchInput ? searchInput.value.trim() : "",
            1
        );
    });
}

if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        fetchAndRenderFeed(query, 1);
    });
}

if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            fetchAndRenderFeed(searchInput.value.trim(), 1);
        }
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        fetchAndRenderFeed("", 1);
    });
}

// ==========================================
// PROFILE POSTS
// ==========================================

if (loadMyPostsBtn) {
    loadMyPostsBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`${API_URL}/posts/me/`, {
                headers: getAuthHeaders()
            });

            const data = await getResponseData(response);

            if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to load your posts.");
            }

            myPostsContainer.innerHTML = "";

            const posts = extractList(data);

            if (posts.length === 0) {
                myPostsContainer.innerHTML = `
                    <p style="padding:1rem;">
                        You haven't posted anything yet.
                    </p>
                `;
                return;
            }

            posts.forEach(post => {
                const el = document.createElement("div");
                el.className = "post-card";
                el.innerHTML = createPostHTML(post);
                myPostsContainer.appendChild(el);
            });
        } catch (error) {
            console.error("Profile posts loading error:", error);
        }
    });
}

// ==========================================
// NAVIGATION
// ==========================================

function showFeed() {
    [authSection, profileSection, adminSection].forEach(section => {
        if (section) {
            section.classList.add("hidden");
        }
    });

    feedSection.classList.remove("hidden");

    [logoutBtn, navFeedBtn, navProfileBtn].forEach(button => {
        if (button) {
            button.classList.remove("hidden");
        }
    });

    updateAdminNavVisibility();

    if (loadPostsBtn) {
        loadPostsBtn.click();
    }
}

async function showProfile() {
    [authSection, feedSection, adminSection].forEach(section => {
        if (section) {
            section.classList.add("hidden");
        }
    });

    profileSection.classList.remove("hidden");

    await fetchProfile(false);

    if (loadMyPostsBtn) {
        loadMyPostsBtn.click();
    }
}

function showAdmin() {
    [authSection, feedSection, profileSection].forEach(section => {
        if (section) {
            section.classList.add("hidden");
        }
    });

    adminSection.classList.remove("hidden");

    fetchStats();
    window.loadReports();
}

function showAuth() {
    [
        feedSection,
        profileSection,
        adminSection,
        logoutBtn,
        navFeedBtn,
        navProfileBtn,
        navAdminBtn
    ].forEach(element => {
        if (element) {
            element.classList.add("hidden");
        }
    });

    authSection.classList.remove("hidden");

    if (loginForm) {
        loginForm.reset();
    }
}

if (navFeedBtn) {
    navFeedBtn.addEventListener("click", showFeed);
}

if (navProfileBtn) {
    navProfileBtn.addEventListener("click", showProfile);
}

if (navAdminBtn) {
    navAdminBtn.addEventListener("click", showAdmin);
}

// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch(`${API_URL}/logout/`, {
                method: "POST",
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error("Logout error:", error);
        }

        localStorage.removeItem("peerview_token");
        localStorage.removeItem("peerview_user");

        showAuth();
    });
}

// ==========================================
// DARK MODE
// ==========================================

if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        const isDark = document.body.classList.contains("dark-mode");

        themeBtn.textContent = isDark
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

        localStorage.setItem(
            "theme",
            isDark ? "dark" : "light"
        );
    });
}

// ==========================================
// VOTING
// ==========================================

window.castVote = async (postId, voteType) => {
    try {
        const response = await fetch(`${API_URL}/interactions/votes/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                post_id: postId,
                vote_type: voteType
            })
        });

        const data = await getResponseData(response);

        if (response.ok) {
            if (!feedSection.classList.contains("hidden")) {
                loadPostsBtn.click();
            } else {
                loadMyPostsBtn.click();
            }
        } else {
            alert(data.message || data.error || "Voting failed.");
        }
    } catch (error) {
        console.error("Voting error:", error);
    }
};

// ==========================================
// LOAD COMMENTS
// ==========================================

window.loadComments = async (postId) => {
    const container = document.getElementById(`comments-container-${postId}`);
    if (!container) return;

    const currentUser = getCurrentUser();

    try {
        const response = await fetch(
            `${API_URL}/interactions/posts/${postId}/comments/`,
            {
                headers: getAuthHeaders()
            }
        );

        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error("Unable to load reviews.");
        }

        const comments = extractList(data);

        if (comments.length === 0) {
            container.innerHTML = `
                <p style="font-size:0.85rem;color:var(--text-muted);">
                    No reviews yet. Be the first!
                </p>
            `;
            return;
        }

        container.innerHTML = comments.map(comment => {
            let actionBtnsHtml = `
                <button onclick="window.reportComment(${comment.id})"
                        style="background:none;border:none;color:var(--text-muted);cursor:pointer;">
                    🚩 Report
                </button>
            `;

            if (
                currentUser &&
                (
                    isUserAdmin(currentUser) ||
                    comment.is_mine
                )
            ) {
                actionBtnsHtml += `
                    <button onclick="window.deleteComment(${comment.id},${postId})"
                            style="background:none;border:none;color:red;cursor:pointer;">
                        🗑️ Delete
                    </button>
                `;
            }

            return `
                <div style="background:var(--bg-color);padding:10px;
                            margin-top:8px;border-radius:6px;
                            border-left:3px solid var(--primary);">
                    <div style="display:flex;justify-content:space-between;">
                        <strong>
                            ${comment.author_display || comment.author || "Reviewer"}
                        </strong>
                        <div>
                            ${actionBtnsHtml}
                        </div>
                    </div>
                    <p style="margin-top:5px;color:var(--text-muted);">
                        ${comment.content}
                    </p>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Comments error:", error);
    }
};

// ==========================================
// POST COMMENT
// ==========================================

window.postComment = async (postId) => {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input || !input.value.trim()) return;

    try {
        const response = await fetch(
            `${API_URL}/interactions/comments/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    post_id: postId,
                    content: input.value.trim()
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to submit review.");
        }

        input.value = "";
        window.loadComments(postId);
    } catch (error) {
        console.error("Comment error:", error);
    }
};

// ==========================================
// REPORT COMMENT
// ==========================================

window.reportComment = async (commentId) => {
    if (!confirm("Report this review to the administrators?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/interactions/comments/${commentId}/report/`,
            {
                method: "POST",
                headers: getAuthHeaders()
            }
        );

        const data = await getResponseData(response);
        alert(data.message || data.error || "Report submitted.");
    } catch (error) {
        console.error("Report error:", error);
    }
};

// ==========================================
// DELETE COMMENT
// ==========================================

window.deleteComment = async (commentId, postId) => {
    if (!confirm("Permanently delete this review?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/interactions/comments/${commentId}/`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        if (response.ok) {
            window.loadComments(postId);
        } else {
            const data = await getResponseData(response);
            alert(data.message || "Unable to delete review.");
        }
    } catch (error) {
        console.error("Delete comment error:", error);
    }
};

// ==========================================
// ADMIN REPORTING TOOLS
// ==========================================

window.loadReports = async () => {
    const container = document.getElementById("reported-comments-container");
    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/interactions/comments/reported/`,
            {
                headers: getAuthHeaders()
            }
        );

        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error("Unable to load reports.");
        }

        const reports = extractList(data);

        if (reports.length === 0) {
            container.innerHTML = `
                <p style="color:#16a34a;font-weight:bold;">
                    ✓ No reported reviews. The community is safe!
                </p>
            `;
            return;
        }

        container.innerHTML = reports.map(report => `
            <div style="border-left:4px solid #dc2626;
                        background:var(--bg-color);
                        padding:10px;margin-bottom:10px;">
                <p>
                    <strong>True Identity:</strong>
                    ${report.real_author || report.author || "Unknown"}
                </p>
                <p>
                    <strong>Review:</strong>
                    ${report.content}
                </p>
                <button onclick="window.deleteComment(${report.id},${report.post_id});
                                 setTimeout(window.loadReports,500);"
                        class="secondary-btn">
                    Trash Review
                </button>
                <button onclick="window.dismissReport(${report.id})"
                        class="secondary-btn">
                    Dismiss
                </button>
            </div>
        `).join("");
    } catch (error) {
        console.error("Admin reports error:", error);
    }
};

// ==========================================
// DISMISS REPORT
// ==========================================

window.dismissReport = async (commentId) => {
    try {
        await fetch(
            `${API_URL}/interactions/comments/${commentId}/dismiss/`,
            {
                method: "POST",
                headers: getAuthHeaders()
            }
        );

        window.loadReports();
    } catch (error) {
        console.error("Dismiss report error:", error);
    }
};

// ==========================================
// DELETE POST
// ==========================================

window.deletePost = async (postId) => {
    if (!confirm("Permanently delete this post?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/posts/${postId}/`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete post.");
        }

        if (loadPostsBtn) {
            loadPostsBtn.click();
        }

        if (
            loadMyPostsBtn &&
            !profileSection.classList.contains("hidden")
        ) {
            loadMyPostsBtn.click();
        }
    } catch (error) {
        console.error("Delete post error:", error);
    }
};

// ==========================================
// ADMIN STATISTICS
// ==========================================

async function fetchStats() {
    try {
        const response = await fetch(`${API_URL}/posts/`, {
            headers: getAuthHeaders()
        });

        const data = await getResponseData(response);
        const posts = extractList(data);

        const statTotal = document.getElementById("stat-total-posts");

        if (statTotal) {
            statTotal.textContent = data.count ?? posts.length;
        }
    } catch (error) {
        console.error("Statistics error:", error);
    }
}