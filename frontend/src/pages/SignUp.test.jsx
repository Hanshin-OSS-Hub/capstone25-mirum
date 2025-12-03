import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUp from './SignUp';

// api 클라이언트를 모의(mock) 처리합니다.
import { api } from './client';
jest.mock('./client');


describe("SignUp Component", () => {

    let mockOnClose;
    let mockOnSignUpSuccess;

    beforeEach(() => {
        mockOnClose = jest.fn();
        mockOnSignUpSuccess = jest.fn();
        // 각 테스트 전에 모의 함수 기록을 초기화합니다.
        jest.clearAllMocks();
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
        // 1. api.post가 성공적으로 응답하도록 설정합니다. (반환값이 없어도 성공)
        api.post.mockResolvedValue({});
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
            // api.post가 올바른 인자와 함께 호출되었는지 확인
            expect(api.post).toHaveBeenCalledWith('user', { username: 'newuser', password: 'password123', nickname: "나 미룸", email: "mirum@hs.ac.kr" });
            expect(mockOnSignUpSuccess).toHaveBeenCalled();
        });
    });



    test("회원가입 실패 시 에러 메시지를 표시한다", async () => {
        // 1. 회원가입 실패(409 Conflict)를 시뮬레이션하는 가짜 fetch 함수를 설정합니다.
        const errorMessageFromServer = '이미 존재하는 아이디입니다.';
        api.post.mockRejectedValue(new Error(errorMessageFromServer));
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