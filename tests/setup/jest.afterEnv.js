beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    if (console.error && typeof console.error.mockRestore === 'function') {
        console.error.mockRestore();
    }
});
