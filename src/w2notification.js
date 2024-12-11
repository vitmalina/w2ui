class w2notification {
    constructor() {
        this.activeNotification = null
        this.timer = null
    }

    /**
     * Enum-like structure containing notification settings.
     */
    static Settings = {
        Type: {
            INFO: 'info',
            ERROR: 'error',
            SUCCESS: 'success'
        },
        Timeout: {
            SHORT: 3000, // 3 seconds
            MEDIUM: 5000, // 5 seconds
            LONG: 10000 // 10 seconds
        },
        Position: {
            CENTER_BOTTOM: 'center-bottom',
            LEFT_BOTTOM: 'left-bottom',
            RIGHT_BOTTOM: 'right-bottom'
        }
    }

    /**
     * Displays a notification.
     * @param {String} text - Notification text
     * @param {Object} options - Settings
     * @returns {Promise} - Resolves when closed
     */
    show(text, options = {}) {
        return new Promise(resolve => {
            // Default settings
            options.type = options.type || w2notification.Settings.Type.SUCCESS
            options.timeout = options.timeout ?? w2notification.Settings.Timeout.MEDIUM
            options.position = options.position ?? w2notification.Settings.Position.RIGHT_BOTTOM
            options.actions = options.actions || [] // Default: No actions
            options.progress = options.progress ?? true
 
            // Remove previous notifications
            if (this.activeNotification) {
                this.remove()
            }

            const containerElement = this.getValidContainer(options.where)

            // Create notification element
            const container = document.createElement('div')
            container.className = `notify-container notify-${options.type} notify-${options.position}`
            container.innerHTML = `
                <div class="notify-content">
                    ${text}
                    <span class="notify-close">&times;</span>
                </div>
            `

            // Add action buttons if provided
            if (options.actions.length > 0) {
                const actionsContainer = document.createElement('div')
                actionsContainer.className = 'notify-actions'

                options.actions.forEach(action => {
                    const button = document.createElement('button')
                    button.className = 'notify-action'
                    button.textContent = action.label
                    button.addEventListener('click', () => {
                        if (typeof action.onClick === 'function') {
                            action.onClick()
                        }
                        this.remove()
                        resolve()
                    })
                    actionsContainer.appendChild(button)
                })

                container.appendChild(actionsContainer)
            }

            // Add progress bar
            if (options.progress && options.timeout > 0) {
                const progressBar = document.createElement('div')
                progressBar.className = `notify-progress ${options.type}`
                progressBar.style.setProperty('--progress-duration', `${options.timeout}ms`)
                container.appendChild(progressBar)
            }

            // Close button
            container.querySelector('.notify-close').addEventListener('click', () => {
                this.remove()
                resolve()
            })

            // Append notification to DOM
            containerElement.appendChild(container)
            this.activeNotification = container

            // Auto-remove
            if (options.timeout > 0) {
                this.timer = setTimeout(() => {
                    this.remove()
                    resolve()
                }, options.timeout)
            }
        })
    }

    /**
     * Returns a valid container. Returns the body if invalid.
     * @param {HTMLElement} container - Target container
     * @returns {HTMLElement} - Valid container
     */
    getValidContainer(container) {
        if (container instanceof HTMLElement) {
            return container
        }
        return document.body
    }

    /**
     * Removes the notification.
     */
    remove() {
        if (this.activeNotification) {
            clearTimeout(this.timer)
            this.activeNotification.remove()
            this.activeNotification = null
            this.timer = null
        }
    }
}

export { w2notification }
