var PasswordApp = angular.module('PasswordApp',['ui.bootstrap']);
var controllers = {};
controllers.PasswordAppController = function ($scope){
    $scope.passwordLength = 15;
    $scope.addUpper       = true;
    $scope.addNumbers     = true;
    $scope.addSymbols        = true;
    $scope.createPassword = function(){
        var lowerCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        var upperCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var numbers = ['0','1','2','3','4','5','6','7','8','9'];
        var symbols = ['!', '#', '$', '%', '&', '(', ')', '*', '+', ':', ';', '<', '=', '>', '?', '@', '[', ']', '^', '_', '{', '}', '~'];
        var finalCharacters = lowerCharacters;
        if($scope.addUpper){
            finalCharacters = finalCharacters.concat(upperCharacters);
        }
        if($scope.addNumbers){
            finalCharacters = finalCharacters.concat(numbers);
        }
        if($scope.addSymbols){
            finalCharacters = finalCharacters.concat(symbols);
        }
        var passwordArray = [];
        var randomValues = new Uint32Array($scope.passwordLength);
        crypto.getRandomValues(randomValues);
        for (var i = 0; i < $scope.passwordLength; i++) {
            passwordArray.push(finalCharacters[randomValues[i] % finalCharacters.length]);
        };
        $scope.password = passwordArray.join("");
    };
};
PasswordApp.controller(controllers);