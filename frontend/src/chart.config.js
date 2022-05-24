const config = {
    Bar: {
        data: {
            datasets: [
                {
                    backgroundColor: 'rgb(241, 241, 241)',
                    borderColor: 'rgb(241, 241, 241)',
                    hoverBackgroundColor: "rgb(14, 165, 233)",
                    borderWidth: 1,
                    borderRadius: 24,
                    maxBarThickness: 32,
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    titleColor: "rgb(255, 255, 255)",
                    backgroundColor: "rgb(0, 0, 0)",
                    padding: 10,
                    bodyColor: "#fff",
                    cornerRadius: 20,
                    boxPadding: 5,
                    displayColors: false,
                    caretPadding: 5,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    }

                },
                y: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        display: false,
                        beginAtZero: true,
                        callback: (label) => {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    },

                }

            }
        }
    },
    Doughnut: {
        data: {
            datasets: [
                {
                    backgroundColor: [
                        'rgb(14, 165, 233)',
                        'rgb(241, 241, 241)'
                    ],
                    borderColor: [
                        'rgb(14, 165, 233)',
                        'rgb(241, 241, 241)'
                    ],
                    hoverOffset: 5,
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    titleColor: "rgb(255, 255, 255)",
                    backgroundColor: "rgb(0, 0, 0)",
                    padding: 10,
                    bodyColor: "#fff",
                    cornerRadius: 20,
                    boxPadding: 5,
                    displayColors: false,
                    caretPadding: 5,
                }
            },
            cutout: '75%',
            layout: {
                padding: {
                    top: 5,
                    bottom: 10,
                }
            }
        }
    },
    Horizontal: {
        data: {
            datasets: [
                {
                    backgroundColor: 'rgb(241, 241, 241)',
                    borderColor: 'rgb(241, 241, 241)',
                    hoverBackgroundColor: "rgb(14, 165, 233)",
                    borderWidth: 1,
                    borderRadius: 24,
                    maxBarThickness: 32,
                }
            ]
        },
        options: {
            indexAxis: 'y',
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    titleColor: "rgb(255, 255, 255)",
                    backgroundColor: "rgb(0, 0, 0)",
                    padding: 10,
                    bodyColor: "#fff",
                    cornerRadius: 20,
                    boxPadding: 5,
                    displayColors: false,
                    caretPadding: 5,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: (label) => {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    }

                },
                y: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        beginAtZero: true,
                    }

                }

            }
        }

    },
    Line: {
        data: {
            datasets: [
                {
                    backgroundColor: "#e0f2fe",
                    borderColor: "#e0f2fe",
                    borderWidth: 1,
                    pointBackgroundColor: "#bae6fd",
                    pointBorderWidth: 2,
                    pointBorderColor: "#bae6fd",
                    pointHitRadius: 10,
                    pointHoverRadius: 10,
                    fill: true,
                    tension: 0.5,
                },
            ]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                layout: {
                    padding: {
                        top: 5,
                        bottom: 5,
                    }
                },
                legend: {
                    display: false,
                },
                tooltip: {
                    titleColor: "rgb(255, 255, 255)",
                    backgroundColor: "#000",
                    padding: 10,
                    bodyColor: "#fff",
                    cornerRadius: 20,
                    boxPadding: 5,
                    displayColors: false,
                    caretPadding: 5,
                },

            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    }
                },
                y: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        display: false,
                        beginAtZero: true,
                        callback: (label) => {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    },

                }
            }
        }
    },
    Pie: {
        data: {
            datasets: [
                {
                    backgroundColor: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#0369a1", "#0c4a6e"],
                    borderColor: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#0369a1", "#0c4a6e"],
                    borderWidth: 1,
                    hoverOffset: 10,
                    fill: true,
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 5,
                    bottom: 5,
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    padding: 10,
                },
                tooltip: {
                    titleColor: "rgb(255, 255, 255)",
                    backgroundColor: "#000",
                    padding: 10,
                    bodyColor: "#fff",
                    cornerRadius: 20,
                    boxPadding: 5,
                    displayColors: false,
                    caretPadding: 5,
                }

            }
        }
    },


}


export { config }