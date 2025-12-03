import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUp from './SignUp';


describe("SignUp Component", () => {

    let mockOnClose;
    let mockOnSignUpSuccess;

    beforeEach(() => {
        mockOnClose = jest.fn();
        mockOnSignUpSuccess = jest.fn();
    });



  test("컴포넌트가 올바르게 렌더링된다", () => {
    render(
      <SignUp
        isOpen={true}
        onClose={mockOnClose}
        onSignUpSuccess={mockOnSignUpSuccess}
      />
    );

    expect(screen.getByRole("heading", { name: "회원가입" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("아이디를 입력하세요")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("비밀번호를 입력하세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회원가입" })).toBeInTheDocument();
  });


    test("입력 없이 제출 시 에러 메시지를 표시한다", async () => {
        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignUpSuccess={mockOnSignUpSuccess}
            />
        );

        const signUpButton = screen.getByRole("button", { name: "회원가입" });
        fireEvent.click(signUpButton);

        const errorMessage = await screen.findByText("아이디와 비밀번호를 입력해주세요.");
        expect(errorMessage).toBeInTheDocument();
    });


    test("성공적으로 회원가입하면 onSignUpSuccess를 호출한다", async () => {
        // 1. 실제 fetch 대신 사용할 가짜 fetch 함수를 설정합니다.
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true, // 성공적인 응답을 시뮬레이션
                json: () => Promise.resolve({ message: '회원가입 성공' }),
            })
        );

        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignUpSuccess={mockOnSignUpSuccess}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("아이디를 입력하세요"), {
            target: { value: "newuser" } 
        });
        fireEvent.change(screen.getByPlaceholderText("비밀번호를 입력하세요"), {
            target: { value: "password123" } 
        });

        const signUpButton = screen.getByRole("button", { name: "회원가입" });
        fireEvent.click(signUpButton);

        await waitFor(() => {
            expect(mockOnSignUpSuccess).toHaveBeenCalled();
        });
    });



    test("회원가입 실패 시 에러 메시지를 표시한다", async () => {
        // 1. 회원가입 실패(409 Conflict)를 시뮬레이션하는 가짜 fetch 함수를 설정합니다.
        const errorMessageFromServer = '이미 존재하는 아이디입니다.';
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 409,
                json: () => Promise.resolve({ message: errorMessageFromServer }),
            })
        );

        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignUpSuccess={mockOnSignUpSuccess}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("아이디를 입력하세요"), {
            target: { value: "existinguser" }
        });
        fireEvent.change(screen.getByPlaceholderText("비밀번호를 입력하세요"), {
            target: { value: "password123" }
        });

        const signUpButton = screen.getByRole("button", { name: "회원가입" });
        fireEvent.click(signUpButton);

        // 4. 에러 메시지가 화면에 나타나는지 확인
        const errorMessage = await screen.findByText(errorMessageFromServer);
        expect(errorMessage).toBeInTheDocument();
        expect(mockOnSignUpSuccess).not.toHaveBeenCalled();
    });



    test("오버레이 클릭 시 onClose가 호출된다", () => {
        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignUpSuccess={mockOnSignUpSuccess}
            />
        );
        // data-testid를 사용하여 오버레이 요소를 정확하게 선택합니다.
        const overlay = screen.getByTestId("overlay");
        fireEvent.mouseDown(overlay);
        expect(mockOnClose).toHaveBeenCalled();
    });    
});